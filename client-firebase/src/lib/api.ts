import { apiRequest } from './queryClient';

// YouTube API functions
export const youtubeApi = {
  checkConnection: () => apiRequest('/api/firebase/youtube/check'),
  connect: () => apiRequest('/api/firebase/youtube/connect', { method: 'POST' }),
  getVideos: () => apiRequest('/api/firebase/youtube/videos'),
  hideVideos: (videoIds: string[]) => 
    apiRequest('/api/firebase/youtube/hide', {
      method: 'POST',
      body: JSON.stringify({ videoIds })
    }),
  restoreVideos: (videoIds: string[]) =>
    apiRequest('/api/firebase/youtube/restore', {
      method: 'POST',
      body: JSON.stringify({ videoIds })
    }),
};

// Facebook API functions
export const facebookApi = {
  checkConnection: () => apiRequest('/api/firebase/facebook/check'),
  connect: () => apiRequest('/api/firebase/facebook/connect', { method: 'POST' }),
  getPosts: () => apiRequest('/api/firebase/facebook/posts'),
  hidePosts: (postIds: string[]) =>
    apiRequest('/api/firebase/facebook/hide', {
      method: 'POST',
      body: JSON.stringify({ postIds })
    }),
  restorePosts: (postIds: string[]) =>
    apiRequest('/api/firebase/facebook/restore', {
      method: 'POST',
      body: JSON.stringify({ postIds })
    }),
};

// User API functions
export const userApi = {
  getConnections: () => apiRequest('/api/firebase/connections'),
  getHistory: () => apiRequest('/api/firebase/history'),
  updateSettings: (settings: any) =>
    apiRequest('/api/firebase/user', {
      method: 'PATCH',
      body: JSON.stringify(settings)
    }),
};