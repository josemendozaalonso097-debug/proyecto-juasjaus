import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(false);
    };
    checkAuth();
  }, []);

  return { user, loading };
}
