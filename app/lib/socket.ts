import { io } from "socket.io-client";
export const socket = io("socket.salamski.com", {
  autoConnect: false,
});
