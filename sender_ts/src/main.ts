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
import { ipcRenderer } from "electron";

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

        this.pointCloudScene = new PointCloudScene();
        // streamer
        this.streamMessage = new StreamMessage();

        if (this.sender) {
            this.streamer = new Streamer();
            this.streamer.delegate = this;
        } else {
            this.streamReader = new StreamReader();

            this.streamReader.onRawDepthUpdated = (pixel: Uint8Array) => {

                const rawDepth: Uint16Array = new Uint16Array(640 * 480);
                const upper = new Uint8Array(640 * 480);
                const lower = new Uint8Array(640 * 480);

                for (let i = 0, d = 0; i < pixel.length; i += 8, d += 3) {
                    let r_1 = pixel[i];
                    let g_1 = pixel[i + 1];
                    let b_1 = pixel[i + 2];
                    let a_1 = pixel[i + 3];
                    let r_2 = pixel[i + 4];
                    let g_2 = pixel[i + 5];
                    let b_2 = pixel[i + 6];
                    let a_2 = pixel[i + 7];
                    upper[d] = r_1;
                    lower[d] = g_1;
                    upper[d + 1] = b_1;
                    lower[d + 1] = r_2;
                    upper[d + 2] = g_2;
                    lower[d + 2] = b_2;
                }

                for (let i = 0; i < upper.length; i += 1) {
                    rawDepth[i] = (upper[i] << 8) + lower[i];
                }

                this.pointCloudScene.updateTexture(rawDepth);

            };
        }

        if (this.sender) {
            let testCanvas = document.createElement('canvas');
            testCanvas.id = 'depth_rgba';
            testCanvas.width = 512;
            testCanvas.height = 400//320;
            document.body.appendChild(testCanvas);
            let context = testCanvas.getContext('2d');
            const img = context.getImageData(0, 0, testCanvas.width, testCanvas.height);
            const data = img.data;

            let checkCanvas = document.createElement('canvas');
            checkCanvas.width = 640;
            checkCanvas.height = 480;
            checkCanvas.id = 'check';
            document.body.appendChild(checkCanvas);
            let checkContext = checkCanvas.getContext('2d');
            let checkImage = checkContext.getImageData(0, 0, 640, 480);
            let checkData = checkImage.data;

            let colorCanvas = document.createElement('canvas');
            colorCanvas.width = 640;
            colorCanvas.height = 480;
            colorCanvas.id = 'color';
            document.body.appendChild(colorCanvas);
            let colorContext = colorCanvas.getContext('2d');
            let colorImg = colorContext.getImageData(0, 0, 640, 480);
            let colorData = colorImg.data;

            // streamser
            this.streamer.setTargetCanvas(testCanvas);
            // RTC
            this.webRTCClient.setVideoStream((colorCanvas as any).captureStream(20));

            // depth 601440px
            ipcRenderer.on('depth', (event, depth: Uint8Array) => {

                const upper_bit_arr = depth.slice(0, depth.length / 2);
                const lower_bit_arr = depth.slice(depth.length / 2, depth.length);

                for (let i = 0, d = 0; i < data.length; i += 8, d += 3) {
                    // 2px (8, 8, 8, - ) x 2 bit 48 bit
                    // depth 3px 48bit 
                    // 640 x 480 x 2/3 におさまる
                    data[i] = upper_bit_arr[d];         // 0 // 3 // 6
                    data[i + 1] = lower_bit_arr[d];     // 0 // 3 // 6 
                    data[i + 2] = upper_bit_arr[d + 1]; // 1 // 4 // 7
                    data[i + 3] = 255;
                    data[i + 4] = lower_bit_arr[d + 1]; // 1 // 4 // 7
                    data[i + 5] = upper_bit_arr[d + 2]; // 2 // 5 // 8
                    data[i + 6] = lower_bit_arr[d + 2]; // 2 // 5 // 8
                    data[i + 7] = 255;
                }

                context.clearRect(0, 0, testCanvas.width, testCanvas.height);
                context.putImageData(img, 0, 0);

                let getData = context.getImageData(0, 0, testCanvas.width, testCanvas.height).data;
                const pixel: Uint8Array = new Uint8Array(getData.buffer)//data.buffer);

                const rawDepth: Uint16Array = new Uint16Array(depth.length / 2);
                const upper = new Uint8Array(depth.length / 2);
                const lower = new Uint8Array(depth.length / 2);

                for (let i = 0, d = 0; i < pixel.length; i += 8, d += 3) {
                    let r_1 = pixel[i];
                    let g_1 = pixel[i + 1];
                    let b_1 = pixel[i + 2];
                    let a_1 = pixel[i + 3];
                    let r_2 = pixel[i + 4];
                    let g_2 = pixel[i + 5];
                    let b_2 = pixel[i + 6];
                    let a_2 = pixel[i + 7];
                    upper[d] = r_1;
                    lower[d] = g_1;
                    upper[d + 1] = b_1;
                    lower[d + 1] = r_2;
                    upper[d + 2] = g_2;
                    lower[d + 2] = b_2;
                }

                for (let i = 0; i < upper.length; i += 1) {
                    rawDepth[i] = (upper[i] << 8) + lower[i];
                }

                let j = 0;
                for (let i = 0; i < checkData.length; i += 4) {
                    let red = rawDepth[j] % 256;
                    checkData[i] = red;
                    checkData[i + 1] = 0;
                    checkData[i + 2] = 0;
                    checkData[i + 3] = 255;
                    j += 1;
                }

                checkContext.putImageData(checkImage, 0, 0);

                this.pointCloudScene.updateTexture(rawDepth);

            });

            // 921600 307200
            ipcRenderer.on('color', (ev, colorFrame: Uint8Array, width: number, height: number) => {
                for (let i = 0, j = 0; i < colorData.length; i += 4, j += 3) {
                    colorData[i] = colorFrame[j];
                    colorData[i + 1] = colorFrame[j + 1];
                    colorData[i + 2] = colorFrame[j + 2];
                    colorData[i + 3] = 255;
                }
                colorContext.putImageData(colorImg, 0, 0);
            });

            this.pointCloudScene.setupColorCanvas(colorCanvas);
        }


        // raw depth length: 307200 // 16bit
        // depth length: 614400 // upper 8bit + lower 8bit
        // rgba 32bit (8, 8, 8, 8) => color 1px depth 2px
        // color_webp_length => raw depth length /2
        // 640 * 480 / 2 

        // 16bit => upper 8bit & lower 8bit
        // canvas pixel r, g, b, a => 8, 8, 8, 8 bit => 16bit depth が 2 pixel 分 格納できる
        // depth 640 x 480 // 307200px ( 1px 16bit)
        // => 601440px ( 1px 8bit)
        // => 150360px (8, 8, 8, 8) の rgba を作れる 480×320
        // => これを復元する
        // => 全てのpixelに対し、r + g => upper 8bit (307200), b + a => lower 8bit (307200) を作成
        // => upper 8bit + lower 8bit で 307200 の Uint16Arrayを復元
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
        element.play();
    }
}

let main: Main
window.onload = () => {
    main = new Main();
};