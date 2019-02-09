import { WebSocketClientDelegate } from "../websocket_client/websocket_client_delegate";
import { WebRTCClientDelegate } from "../webrtc_client/webrtc_client_delegate";
import { SignalingMessage } from "../models/json/signaling_message";
import { WebSocketClient } from "../websocket_client/websocket_client";
import { WebRTCClient } from "../webrtc_client/webrtc_client";
import { WebRTCUtil } from "../util/util"

export class Signling implements WebSocketClientDelegate, WebRTCClientDelegate {

    private gateway: WebSocketClient
    private target: WebRTCClient
    constructor(socket: WebSocketClient, rtc: WebRTCClient) {
        this.gateway = socket;
        this.target = rtc;
    }

    // WebSocketClientDelegate
    onSignalingMessage = async (message: SignalingMessage) => {
        switch (message.type) {
            case 'offer': {
                const offerSdp = WebRTCUtil.ConvertMessageToSdp(message);
                await this.target.setOfferAsync(offerSdp, (answer) => {
                    const message = WebRTCUtil.ConvertSdpToMessage(answer);
                    this.gateway.sendMessage(JSON.stringify(message));
                });
                break;
            }
            case 'answer': {
                const answerSdp = WebRTCUtil.ConvertMessageToSdp(message);
                await this.target.setAnswerAsync(answerSdp);
                break;
            }
            case 'candidate': {
                await this.target.addIceCandidate(message.ice);
                break;
            }
            default: {
                break;
            }
        }
    };

    // WebRTCClientDelegate
    didGenerateCandidte = (candidate: RTCIceCandidate) => {
        const message = WebRTCUtil.ConvertCandidateToMessage(candidate);
        this.gateway.sendMessage(JSON.stringify(message));
    };

    onMessageFrom = (ch: RTCDataChannel, event: MessageEvent) => {

    }
}