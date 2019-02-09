import { WebSocketClient } from "./websocket_client/websocket_client";
import { WebRTCClient } from "./webrtc_client/webrtc_client";
import { WebRTCUtil } from "./util/util";
import { Signling } from "./signaling/signaling";

class Main {

    webSocketClient: WebSocketClient
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
        this.webRTCClient.delegate = this.signling;
        this.webSocketClient.delegate = this.signling;
    }

    private setupEvents = () => {
        document.getElementById('webrtcConnectButton').onclick = this.connect;
        document.getElementById('webrtcDisconnectButton').onclick = this.disconnect;
    };

    private connect = async () => {
        const offer = await this.webRTCClient.connect();
        const message = WebRTCUtil.ConvertSdpToMessage(offer);
        this.webSocketClient.sendMessage(JSON.stringify(message));
    };

    private disconnect = async () => { }
}

let main: Main
window.onload = () => {
    main = new Main();
};