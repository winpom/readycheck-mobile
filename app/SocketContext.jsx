import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://192.168.2.22:3000');
    setSocket(newSocket);
  
    newSocket.on('connect', () => {
      console.log('Socket connected with ID:', newSocket.id);
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
