
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useConectividade() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const sub = NetInfo.addEventListener(state => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    NetInfo.fetch().then(s => setOnline(Boolean(s.isConnected && s.isInternetReachable !== false)));

    return () => sub();
  }, []);

  return { online };
}
