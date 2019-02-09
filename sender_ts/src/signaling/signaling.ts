import { WebSocketClientDelegate } from "../websocket_client/websocket_client_delegate";
import { SignalingMessage } from "../models/json/signaling_message";
import { WebSocketClient } from "../websocket_client/websocket_client";
import { WebRTCClient } from "../webrtc_client/webrtc_client";
import { WebRTCUtil } from "../util/util"
import { WebRTCSignalingDelegate } from "../webrtc_client/webrtc_signaling_delegate";

export class Signling implements WebSocketClientDelegate, WebRTCSignalingDelegate {

    private gateway: WebSocketClient
    private target: WebRTCClient

    constructor(socket: WebSocketClient, rtc: WebRTCClient) {
        this.gateway = socket;
        this.target = rtc;
    }

    // WebSocketClientDelegate
    onSignalingMessage = async (message: SignalingMessage) => {
        console.log("signaling recieved:", message);
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
    didGenerateCandidate = (candidate: RTCIceCandidate) => {
        const message = WebRTCUtil.ConvertCandidateToMessage(candidate);
        this.gateway.sendMessage(JSON.stringify(message));
    };
}