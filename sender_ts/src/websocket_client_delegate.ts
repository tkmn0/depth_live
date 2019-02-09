import { SignalingMessage } from "./signaling_message";

export interface WebSocketClientDelegate {
    onMessage: (messsage: SignalingMessage) => void
}