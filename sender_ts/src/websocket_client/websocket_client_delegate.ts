import { SignalingMessage } from "../models/json/signaling_message";

export interface WebSocketClientDelegate {
    onSignalingMessage: (messsage: SignalingMessage) => void
}