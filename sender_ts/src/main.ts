import { WebSocketClient } from "./websocket_client/websocket_client";
import { WebRTCClient } from "./webrtc_client/webrtc_client";
import { WebRTCUtil } from "./util/util";
import { Signling } from "./signaling/signaling";
import { ISignalingGateway } from "./signaling/signaling_gateway";
import { Streamer } from "./streamer/streamer";
import { Stream } from "stream";
import { Channels } from "./models/channels";
import { StreamerDelegate } from "./streamer/streamer_delegate";

class Main implements StreamerDelegate {

    signalingGateway: ISignalingGateway
    webRTCClient: WebRTCClient
    signling: Signling
    streamer: Streamer
    total: number
    readed: number

    constructor() {
        this.setupEvents();

        this.signalingGateway = new WebSocketClient();
        this.webRTCClient = new WebRTCClient({
            video: false,
            audio: false,
            data: true
        });
        this.signling = new Signling(this.signalingGateway, this.webRTCClient);
        this.webRTCClient.signalingDelegate = this.signling;
        this.signalingGateway.onSignalingMessage = this.signling.onSignalingMessage;
        this.streamer = new Streamer();
        this.streamer.startSession({ video: true, audio: false, data: false });
        this.streamer.delegate = this;
    }

    private setupEvents = () => {
        document.getElementById('webrtcConnectButton').onclick = this.connect;
        document.getElementById('webrtcDisconnectButton').onclick = this.disconnect;
    };

    private connect = async () => {
        const offer = await this.webRTCClient.connect();
        const message = WebRTCUtil.ConvertSdpToMessage(offer);
        this.signalingGateway.sendMessage(message);
    };

    private disconnect = async () => { }

    readStart = (totalLength: number) => {
        this.total = totalLength;
        console.log('read start:', totalLength);
    };

    readBytes = (chunk: ArrayBuffer) => {
        this.readed += chunk.byteLength;
        console.log(chunk.byteLength);
    };
}

let main: Main
window.onload = () => {
    main = new Main();
};