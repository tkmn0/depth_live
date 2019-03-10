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
import { PointCloudScene } from "./three/point_cloud_scene";
import { PixelConverter } from "./pixel_converter/pixel_converter"
import { RealsenseGateway } from "./depth_camera/realsense/real_sense_gateway";

class Main implements StreamerDelegate, WebRTCClientDelegate {

    sender: boolean;
    signalingGateway: ISignalingGateway
    webRTCClient: WebRTCClient
    signling: Signling
    streamer: Streamer
    streamReader: StreamReader
    streamMessage: StreamMessage
    readBuffer: Float32Array
    pointCloudScene: PointCloudScene
    realsenseGateway: RealsenseGateway;

    constructor() {
        this.setupType();
        this.setupEvents();

        // webrtc
        this.webRTCClient = new WebRTCClient({
            video: !this.sender,
            audio: false,
            data: true
        });
        this.webRTCClient.delegate = this;

        // signlaing
        this.signalingGateway = new WebSocketClient();
        this.signling = new Signling(this.signalingGateway, this.webRTCClient);
        this.webRTCClient.signalingDelegate = this.signling;
        this.signalingGateway.onSignalingMessage = this.signling.onSignalingMessage;

        // pointcloud 
        this.pointCloudScene = new PointCloudScene();

        // streamer
        this.streamMessage = new StreamMessage();

        // realsense
        this.realsenseGateway = new RealsenseGateway(false, false, false);
        this.realsenseGateway.onRawDepthUpdated = (rawDepth: Uint16Array) => {
            this.pointCloudScene.updateTexture(rawDepth);
        };

        if (this.sender) {
            this.streamer = new Streamer();
            this.streamer.delegate = this;
            const ipcRenderer = require("electron").ipcRenderer;
            // from main process
            ipcRenderer.on('depth', this.realsenseGateway.onDepthFrame);
            ipcRenderer.on('color', this.realsenseGateway.onColorFlame);
            this.pointCloudScene.setupColorCanvas(this.realsenseGateway.ColorCanvas());

            // send depth to peer via webrtc data channel
            this.streamer.setTargetCanvas(this.realsenseGateway.DepthCanvas());
            // send color to peer via webrtc media channel
            this.webRTCClient.setVideoStream((this.realsenseGateway.ColorCanvas() as any).captureStream(20));
        } else {
            this.streamReader = new StreamReader();
            let pixelConverter = new PixelConverter();

            // draw remote depth
            this.streamReader.onRawDepthUpdated = (pixel: Uint8Array) => {
                let rawDepth: Uint16Array;
                const upper = new Uint8Array(640 * 480);
                const lower = new Uint8Array(640 * 480);
                rawDepth = pixelConverter.RGBtoRawDepth(pixel, upper, lower);
                this.pointCloudScene.updateTexture(rawDepth);
            };
        }
    }

    private setupType = () => {
        let urlParams = new URLSearchParams(location.search);
        let type = urlParams.get('type');
        if (type == 'sender') {
            this.sender = true;
        } else {
            this.sender = false;
        }
    }

    private setupEvents = () => {
        document.getElementById('webrtcConnectButton').onclick = this.connect;
        document.getElementById('webrtcDisconnectButton').onclick = this.disconnect;
        document.getElementById('removeVideoButton').onclick = () => {
            console.log("play video");
            console.log(this.webRTCClient.hasLocalStream());
            if (!this.webRTCClient.hasLocalStream()) {
                this.webRTCClient.setupAsync();
            } else {
                (document.getElementById('remote_color') as HTMLVideoElement).play();
            }

        };
    };

    private connect = async () => {
        const offer = await this.webRTCClient.connect();
        const message = WebRTCUtil.ConvertSdpToMessage(offer);
        this.signalingGateway.sendMessage(message);
    };

    private disconnect = async () => { }

    // Streamer Delegate
    readStart = (totalLength: number) => {
        this.webRTCClient.sendBuffer(this.streamMessage.start());
    };

    readDone = () => {
        this.webRTCClient.sendBuffer(this.streamMessage.done());
    };

    readBytes = (chunk: ArrayBuffer) => {
        this.webRTCClient.sendBuffer(chunk);
    };

    // WebRTCClient Delegate
    onMessageFrom = (ch: RTCDataChannel, message: MessageEvent) => {
        let buffer = message.data as ArrayBuffer
        this.streamReader.read(buffer);
    };

    onAddStream = (stream: MediaStream) => {
        if (stream.getTracks()[0].kind == "video") {
            let video = document.createElement("video");
            video.autoplay = true;
            video.id = "remote_color";
            document.body.appendChild(video);

            if (!this.sender) {
                video.onplay = event => {
                    this.pointCloudScene.setupColorCanvas(video);
                };
            }
            this.playVideo(video, stream);
        }
    };

    private playVideo(element, stream: MediaStream) {
        element.srcObject = stream;
        // element.play();
    }
}

let main: Main
window.onload = () => {
    main = new Main();
};