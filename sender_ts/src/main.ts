import { WebSocketClient } from "./websocket_client/websocket_client";
import { WebRTCClient } from "./webrtc_client/webrtc_client";
import { WebRTCUtil } from "./util/util";
import { Signling } from "./signaling/signaling";
import { ISignalingGateway } from "./signaling/signaling_gateway";
import { Streamer } from "./streamer/streamer";
import { StreamerDelegate } from "./streamer/streamer_delegate";
import { StreamReader } from "./stream_reader/stream_reader";

class Main implements StreamerDelegate {

    sender: boolean = true;
    signalingGateway: ISignalingGateway
    webRTCClient: WebRTCClient
    signling: Signling
    streamer: Streamer
    streamReader: StreamReader

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

        if (this.sender) {
            this.streamer = new Streamer();
            this.streamer.startSession({ video: true, audio: false, data: false });
            this.streamer.delegate = this;

            this.streamReader = new StreamReader();
            this.streamReader.getCanvas().width = 640;
            this.streamReader.getCanvas().height = 480;
            document.body.appendChild(this.streamReader.getCanvas());
        } else {
            // this.streamReader = new StreamReader();
            // this.streamReader.getCanvas().width = 640;
            // this.streamReader.getCanvas().height = 480;
        }
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
        this.streamReader.readStart();
    };

    readDone = () => {
        this.streamReader.readDone();
    };

    readBytes = (chunk: ArrayBuffer) => {
        this.streamReader.readBytes(chunk);
    };
}

let main: Main
window.onload = () => {
    main = new Main();
};