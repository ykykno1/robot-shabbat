import { useState, useCallback } from 'react';

export function useFirebaseApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('firebase_app_token');

  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const response = await fetch(`/api${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url: string) => apiCall(url), [apiCall]);
  
  const post = useCallback((url: string, data: any) => 
    apiCall(url, { method: 'POST', body: JSON.stringify(data) }), 
    [apiCall]
  );
  
  const put = useCallback((url: string, data: any) => 
    apiCall(url, { method: 'PUT', body: JSON.stringify(data) }), 
    [apiCall]
  );
  
  const del = useCallback((url: string) => 
    apiCall(url, { method: 'DELETE' }), 
    [apiCall]
  );

  return { get, post, put, del, loading, error };
}