import { WebSocketClient } from "./websocket_client/websocket_client";
import { WebRTCClient } from "./webrtc_client/webrtc_client";
import { WebRTCUtil } from "./util/util";
import { Signling } from "./signaling/signaling";
import { ISignalingGateway } from "./signaling/signaling_gateway";

class Main {

    webSocketClient: ISignalingGateway
    webRTCClient: WebRTCClient
    signling: Signling

    constructor() {
        this.setupEvents();
        this.webSocketClient = new WebSocketClient();
        this.webRTCClient = new WebRTCClient({
            video: false,
            audio: false,
            data: true
        });
        this.signling = new Signling(this.webSocketClient, this.webRTCClient);
        this.webRTCClient.signalingDelegate = this.signling;
        this.webSocketClient.onSignalingMessage = this.signling.onSignalingMessage;
    }

    private setupEvents = () => {
        document.getElementById('webrtcConnectButton').onclick = this.connect;
        document.getElementById('webrtcDisconnectButton').onclick = this.disconnect;
    };

    private connect = async () => {
        const offer = await this.webRTCClient.connect();
        const message = WebRTCUtil.ConvertSdpToMessage(offer);
        this.webSocketClient.sendMessage(message);
    };

    private disconnect = async () => { }
}

let main: Main
window.onload = () => {
    main = new Main();
};