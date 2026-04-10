import fetch from 'node-fetch';

interface YouTubeVideo {
  id: string;
  title: string;
  description?: string;
  publishedAt: string;
  thumbnailUrl?: string;
  privacyStatus: 'public' | 'private' | 'unlisted';
}

export async function getYouTubeVideos(accessToken: string): Promise<YouTubeVideo[]> {
  try {
    // First, get the user's channel
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!channelResponse.ok) {
      throw new Error(`YouTube API error: ${channelResponse.statusText}`);
    }

    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      return [];
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Get videos from uploads playlist
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${uploadsPlaylistId}&maxResults=50`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.statusText}`);
    }

    const videosData = await videosResponse.json();
    const videoIds = videosData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

    // Get detailed video info including privacy status
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,status&id=${videoIds}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!detailsResponse.ok) {
      throw new Error(`YouTube API error: ${detailsResponse.statusText}`);
    }

    const detailsData = await detailsResponse.json();

    return detailsData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      publishedAt: video.snippet.publishedAt,
      thumbnailUrl: video.snippet.thumbnails?.default?.url,
      privacyStatus: video.status.privacyStatus,
    }));
  } catch (error) {
    console.error('Failed to get YouTube videos:', error);
    throw error;
  }
}

export async function hideYouTubeVideos(
  accessToken: string, 
  videoIds: string[]
): Promise<{ success: boolean; affectedCount: number; error?: string }> {
  let affectedCount = 0;
  const errors: string[] = [];

  for (const videoId of videoIds) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: videoId,
            status: {
              privacyStatus: 'private',
            },
          }),
        }
      );

      if (response.ok) {
        affectedCount++;
      } else {
        const error = await response.text();
        errors.push(`Video ${videoId}: ${error}`);
      }
    } catch (error) {
      errors.push(`Video ${videoId}: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    affectedCount,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

export async function restoreYouTubeVideos(
  accessToken: string,
  videoRestoreMap: [string, string][] // [videoId, originalPrivacyStatus]
): Promise<{ success: boolean; affectedCount: number; error?: string }> {
  let affectedCount = 0;
  const errors: string[] = [];

  for (const [videoId, privacyStatus] of videoRestoreMap) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=status`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: videoId,
            status: {
              privacyStatus,
            },
          }),
        }
      );

      if (response.ok) {
        affectedCount++;
      } else {
        const error = await response.text();
        errors.push(`Video ${videoId}: ${error}`);
      }
    } catch (error) {
      errors.push(`Video ${videoId}: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    affectedCount,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

export async function refreshYouTubeToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '169491902267-jvnsm8e68e0ndp40mkj1ecqto6mhb23n.apps.googleusercontent.com';
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh YouTube token');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}