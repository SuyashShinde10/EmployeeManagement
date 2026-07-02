import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'https://employeemanagement-eta-seven.vercel.app';

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true
});
