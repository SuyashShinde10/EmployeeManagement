import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'https://employeemanagement-eta-seven.vercel.app';

// Vercel serverless does not support persistent WebSockets/Socket.io.
// We disable socket connection on vercel.app domains to prevent console warnings/errors,
// falling back safely to our robust 5-second polling synchronization.
export const isSocketSupported = !window.location.hostname.endsWith('vercel.app');

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket'],
  reconnection: isSocketSupported
});
