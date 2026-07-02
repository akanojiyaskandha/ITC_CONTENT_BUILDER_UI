
import { useState, useCallback } from 'react';

export default function useApi(apiFunc) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
    //   console.log(response.status ,"response")
      setData(response?.data?.data || response);
      return response;
    } catch (err) {
      setError(err?.error?.message || 'Unexpected error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  return {
    data,
    loading,
    error,
    request,
  };
}
