import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { envConfig } from '../env';
import { useAuth } from './useAuth';

export const useSocket = () => {
  const { auth } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!auth?.accessToken) {
      socket?.disconnect();
      setSocket(null);
      return;
    }

    const instance = io(`${envConfig.VITE_WEBSOCKET_URL}/chat`, {
      transports: ['websocket'],
      auth: { token: auth.accessToken },
    });
    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [auth?.accessToken]);

  return socket;
};
