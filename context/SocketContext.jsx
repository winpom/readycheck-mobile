import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useGlobalContext } from '../context/GlobalProvider';
import { SOCKET_URL } from '@env';

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useGlobalContext();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);
  
    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
      if (user?.$id) {
          newSocket.emit("joinUserRoom", user.$id);
      }
  });
    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  
    return () => {
      console.log('Socket closing');
      newSocket.close();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
