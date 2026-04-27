import { io } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
