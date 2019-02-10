import { WebSocketClient } from "./websocket_client/websocket_client";
import { WebRTCClient } from "./webrtc_client/webrtc_client";
import { WebRTCUtil } from "./util/util";
import { Signling } from "./signaling/signaling";
import { ISignalingGateway } from "./signaling/signaling_gateway";
import { Streamer } from "./streamer/streamer";
import { StreamerDelegate } from "./streamer/streamer_delegate";
import { StreamReader } from "./stream_reader/stream_reader";
import { StreamMessage } from "./models/stream_message";
import { WebRTCClientDelegate } from "./webrtc_client/webrtc_client_delegate";

class Main implements StreamerDelegate, WebRTCClientDelegate {

    sender: boolean;
    signalingGateway: ISignalingGateway
    webRTCClient: WebRTCClient
    signling: Signling
    streamer: Streamer
    streamReader: StreamReader
    streamMessage: StreamMessage

    constructor() {
        let urlParams = new URLSearchParams(location.search);
        let type = urlParams.get('type');
        if (type == 'sender') {
            this.sender = true;
        } else {
            this.sender = false;
        }

        this.setupEvents();

        // webrtc
        this.webRTCClient = new WebRTCClient({
            video: false,
            audio: false,
            data: true
        });
        this.webRTCClient.delegate = this;

        // signlaing
        this.signalingGateway = new WebSocketClient();
        this.signling = new Signling(this.signalingGateway, this.webRTCClient);
        this.webRTCClient.signalingDelegate = this.signling;
        this.signalingGateway.onSignalingMessage = this.signling.onSignalingMessage;

        // streamer
        this.streamMessage = new StreamMessage();

        if (this.sender) {
            this.streamer = new Streamer();
            this.streamer.startSession({ video: true, audio: false, data: false });
            this.streamer.delegate = this;
        } else {
            this.streamReader = new StreamReader();
            this.streamReader.getCanvas().width = 640;
            this.streamReader.getCanvas().height = 480;
            document.body.appendChild(this.streamReader.getCanvas());
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
        this.webRTCClient.sendBuffer(this.streamMessage.start());
    };

    readDone = () => {
        this.webRTCClient.sendBuffer(this.streamMessage.done());
    };

    readBytes = (chunk: ArrayBuffer) => {
        this.webRTCClient.sendBuffer(chunk);
    };

    onMessageFrom = (ch: RTCDataChannel, message: MessageEvent) => {
        let buffer = message.data as ArrayBuffer
        this.streamReader.read(buffer);
    };
}

let main: Main
window.onload = () => {
    main = new Main();
};