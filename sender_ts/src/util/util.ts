import { SignalingMessage } from "../models/json/signaling_message";

export class WebRTCUtil {
    static ConvertSdpToMessage(from: RTCSessionDescription): SignalingMessage {
        let message: SignalingMessage = {
            type: from.type,
            sdp: from.sdp,
            ice: null
        };
        return message;
    }

    static ConvertMessageToSdp(message: SignalingMessage): RTCSessionDescription {
        let type: RTCSdpType;
        type = message.type as RTCSdpType
        const sdpInit: RTCSessionDescriptionInit = {
            sdp: message.sdp,
            type: type
        };
        return new RTCSessionDescription(sdpInit);
    }

    static ConvertCandidateToMessage(candidate: RTCIceCandidate): SignalingMessage {
        const message: SignalingMessage = {
            type: 'candidate',
            ice: candidate,
            sdp: null
        };
        return message;
    }
}