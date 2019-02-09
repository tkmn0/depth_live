import { WebSocketClient } from "./websocket_client";
import { WebSocketClientDelegate } from "./websocket_client_delegate";
import { SignalingMessage } from "./signaling_message";
import { WebRTCClient } from "./webrtc_client";
import { WebRTCClientDelegate } from "./webrtc_client_delegate";

class Main implements WebSocketClientDelegate, WebRTCClientDelegate {

    webSocketClient: WebSocketClient
    webRTCClient: WebRTCClient

    constructor() {
        this.setupEvents();
        this.webSocketClient = new WebSocketClient();
        this.webSocketClient.delegate = this;
        this.webRTCClient = new WebRTCClient({
            video: false,
            audio: false,
            data: true
        });
        this.webRTCClient.delegate = this;
    }

    private setupEvents = () => {
        document.getElementById('webrtcConnectButton').onclick = async () => {
            console.log('connect webrtc');
            const offer = await this.webRTCClient.makeOfferAsync();
            const message: SignalingMessage = {
                type: offer.type,
                sdp: offer.sdp,
                ice: null
            };

            this.webSocketClient.sendMessage(JSON.stringify(message));
        };
        document.getElementById('webrtcDisconnectButton').onclick = () => {

        };
    };

    // websocket 
    onMessage = async (message: SignalingMessage) => {
        console.log(message);

        switch (message.type) {
            case 'offer': {
                const sdpInit: RTCSessionDescriptionInit = {
                    sdp: message.sdp,
                    type: message.type
                };
                sdpInit.sdp = message.sdp;
                sdpInit.type = message.type;

                await this.webRTCClient.setOfferAsync(new RTCSessionDescription(sdpInit), (answer) => {
                    const message: SignalingMessage = {
                        sdp: answer.sdp,
                        type: answer.type,
                        ice: null
                    }
                    this.webSocketClient.sendMessage(JSON.stringify(message));
                });
                break;
            }
            case 'answer': {
                const sdpInit: RTCSessionDescriptionInit = {
                    sdp: message.sdp,
                    type: message.type
                };
                sdpInit.sdp = message.sdp;
                sdpInit.type = message.type;
                await this.webRTCClient.setAnswerAsync(new RTCSessionDescription(sdpInit));
                break;
            }
            case 'candidate': {
                await this.webRTCClient.addIceCandidate(message.ice);
                break;
            }
            default: {
                break;
            }
        }
    }

    // WebRTC
    didGenerateCandidte = (candidate: RTCIceCandidate) => {
        console.log(candidate);
        const message: SignalingMessage = {
            type: 'candidate',
            ice: candidate,
            sdp: null
        };
        this.webSocketClient.sendMessage(JSON.stringify(message));
    }
}

let main: Main
window.onload = () => {
    main = new Main();
};