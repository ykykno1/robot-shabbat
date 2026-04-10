import fetch from 'node-fetch';

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  privacy: {
    value: string;
    description?: string;
  };
  attachments?: any;
  full_picture?: string;
  picture?: string;
  type?: string;
  story?: string;
}

export async function getFacebookPosts(accessToken: string): Promise<FacebookPost[]> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/me/posts?fields=id,message,created_time,privacy,attachments{type,media,url,subattachments},full_picture,picture,type,story&access_token=${accessToken}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to fetch Facebook posts');
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Failed to get Facebook posts:', error);
    throw error;
  }
}

export async function hideFacebookPosts(
  accessToken: string,
  postIds: string[]
): Promise<{ success: boolean; affectedCount: number; error?: string }> {
  let affectedCount = 0;
  const errors: string[] = [];

  for (const postId of postIds) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v22.0/${postId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            privacy: { value: 'SELF' },
            access_token: accessToken,
          }),
        }
      );

      if (response.ok) {
        affectedCount++;
      } else {
        const error = await response.json();
        errors.push(`Post ${postId}: ${error.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      errors.push(`Post ${postId}: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    affectedCount,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

export async function restoreFacebookPosts(
  accessToken: string,
  postIds: string[]
): Promise<{ success: boolean; affectedCount: number; error?: string }> {
  let affectedCount = 0;
  const errors: string[] = [];

  for (const postId of postIds) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/v22.0/${postId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            privacy: { value: 'EVERYONE' },
            access_token: accessToken,
          }),
        }
      );

      if (response.ok) {
        affectedCount++;
      } else {
        const error = await response.json();
        errors.push(`Post ${postId}: ${error.error?.message || 'Unknown error'}`);
      }
    } catch (error) {
      errors.push(`Post ${postId}: ${error}`);
    }
  }

  return {
    success: errors.length === 0,
    affectedCount,
    error: errors.length > 0 ? errors.join('; ') : undefined,
  };
}

export async function validateFacebookToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v22.0/me?access_token=${accessToken}`
    );
    return response.ok;
  } catch {
    return false;
  }
}

export async function exchangeFacebookToken(
  shortLivedToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '1176249107048528';
  const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';

  const response = await fetch(
    `https://graph.facebook.com/v22.0/oauth/access_token?` +
    `grant_type=fb_exchange_token&` +
    `client_id=${FACEBOOK_APP_ID}&` +
    `client_secret=${FACEBOOK_APP_SECRET}&` +
    `fb_exchange_token=${shortLivedToken}`
  );

  if (!response.ok) {
    throw new Error('Failed to exchange Facebook token');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in || 5184000, // Default to 60 days
  };
}