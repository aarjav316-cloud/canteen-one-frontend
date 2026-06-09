import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"], // Allow fallback to polling
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

// Track rooms so we can re-join on reconnect
const joinedRooms = new Set();

socket.on("connect", () => {
  console.log("🟢 Socket connected:", socket.id);
  // Re-join all rooms after reconnect
  for (const room of joinedRooms) {
    socket.emit(room.event, room.data);
  }
});

socket.on("disconnect", (reason) => {
  console.warn("🔴 Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.error("🟡 Socket connection error:", err.message);
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = () => {
  joinedRooms.clear();
  if (socket.connected) {
    socket.disconnect();
  }
};

/**
 * Join a room and track it for automatic re-join on reconnect
 */
export const joinRoom = (event, data) => {
  joinedRooms.add({ event, data });
  if (socket.connected) {
    socket.emit(event, data);
  }
};

/**
 * Leave a room (remove from tracking)
 */
export const leaveRoom = (event) => {
  for (const room of joinedRooms) {
    if (room.event === event) {
      joinedRooms.delete(room);
    }
  }
};
