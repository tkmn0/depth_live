import { SignalingMessage } from "../models/json/signaling_message";
import { WebRTCClient } from "../webrtc_client/webrtc_client";
import { WebRTCUtil } from "../util/util"
import { WebRTCSignalingDelegate } from "../webrtc_client/webrtc_signaling_delegate";
import { ISignalingGateway } from "./signaling_gateway";

export class Signling implements WebRTCSignalingDelegate {

    private gateway: ISignalingGateway
    private target: WebRTCClient

    constructor(gateway: ISignalingGateway, rtc: WebRTCClient) {
        this.gateway = gateway;
        this.target = rtc;
    }

    onSignalingMessage = async (message: SignalingMessage) => {
        switch (message.type) {
            case 'offer': {
                const offerSdp = WebRTCUtil.ConvertMessageToSdp(message);
                await this.target.setOfferAsync(offerSdp, (answer) => {
                    const message = WebRTCUtil.ConvertSdpToMessage(answer);
                    this.gateway.sendMessage(message);
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
        this.gateway.sendMessage(message);
    };
}