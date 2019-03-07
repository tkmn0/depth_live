import { SignalingMessage } from "../models/json/signaling_message";

export interface ISignalingGateway {
    sendMessage(message: SignalingMessage): void
    onSignalingMessage: (messsage: SignalingMessage) => void
}