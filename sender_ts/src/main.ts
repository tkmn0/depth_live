import { WebSocketClient } from "./websocket_client/websocket_client";
import { WebRTCClient } from "./webrtc_client/webrtc_client";
import { WebRTCUtil } from "./util/util";
import { Signling } from "./signaling/signaling";
import { ISignalingGateway } from "./signaling/signaling_gateway";
import { Streamer } from "./streamer/streamer";
import { StreamerDelegate } from "./streamer/streamer_delegate";

class Main implements StreamerDelegate {

    signalingGateway: ISignalingGateway
    webRTCClient: WebRTCClient
    signling: Signling
    streamer: Streamer
    total: number
    chunks: ArrayBuffer[]
    image: HTMLImageElement
    testCanvas: HTMLCanvasElement

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

        this.testCanvas = document.createElement('canvas');
        document.body.appendChild(this.testCanvas);
        this.testCanvas.width = 640;
        this.testCanvas.height = 480;
        this.image = document.createElement('img');

        setInterval(() => { this.testCanvas.getContext('2d').drawImage(this.image, 0, 0); }, 1000 / 30);
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
        this.chunks = new Array();
        this.total = totalLength;
    };

    readDone = () => {
        const blob = new Blob(this.chunks, { type: 'image/webp' });
        this.image.src = URL.createObjectURL(blob);
    };

    concatChunks = (chunks: ArrayBuffer[], totalLength: number): ArrayBuffer => {
        let result = new Uint8Array(totalLength);
        let offset = 0;
        chunks.forEach((chunk) => {
            result.set(new Uint8Array(chunk), offset);
            offset += chunk.byteLength;
        });

        return result.buffer;
    };

    readBytes = (chunk: ArrayBuffer) => {
        this.chunks.push(chunk);
    };
}

let main: Main
window.onload = () => {
    main = new Main();
};