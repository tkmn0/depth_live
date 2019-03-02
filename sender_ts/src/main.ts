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
import { DepthCamera } from "./depth_camera/realsense/depth_camera";
import { ipcRenderer } from "electron";
import { PointCloudScene } from "./three/point_cloud_scene";
const fs = require('fs');
const dataUriToBuffer = require('data-uri-to-buffer');


class Main implements StreamerDelegate, WebRTCClientDelegate {

    sender: boolean;
    signalingGateway: ISignalingGateway
    webRTCClient: WebRTCClient
    signling: Signling
    streamer: Streamer
    streamReader: StreamReader
    streamMessage: StreamMessage
    readBuffer: Float32Array

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
        // this.signalingGateway = new WebSocketClient();
        this.signling = new Signling(this.signalingGateway, this.webRTCClient);
        this.webRTCClient.signalingDelegate = this.signling;
        // this.signalingGateway.onSignalingMessage = this.signling.onSignalingMessage;

        // streamer
        this.streamMessage = new StreamMessage();

        if (this.sender) {
            // this.setupDepth();
            // this.streamer = new Streamer();
            // this.streamer.startSession({ video: true, audio: false, data: false });
            // this.streamer.delegate = this;
        } else {
            this.streamReader = new StreamReader();
            this.streamReader.getCanvas().width = 640;
            this.streamReader.getCanvas().height = 480;
            document.body.appendChild(this.streamReader.getCanvas());
        }

        const pointCloudScene = new PointCloudScene();

        let testCanvas = document.createElement('canvas');
        testCanvas.id = 'depth_rgba';
        testCanvas.width = 480;
        testCanvas.height = 320;
        document.body.appendChild(testCanvas);
        let context = testCanvas.getContext('2d');
        const img = context.getImageData(0, 0, 480, 320);
        const data = img.data;

        let checkCanvas = document.createElement('canvas');
        checkCanvas.width = 640;
        checkCanvas.height = 480;
        checkCanvas.id = 'check';
        document.body.appendChild(checkCanvas);
        let checkContext = checkCanvas.getContext('2d');
        let checkImage = checkContext.getImageData(0, 0, 640, 480);
        let checkData = checkImage.data;

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

        // depth 601440px
        ipcRenderer.on('depth', (event, depth: Uint8Array) => {

            const upper_bit_arr = depth.slice(0, depth.length / 2);
            const lower_bit_arr = depth.slice(depth.length / 2, depth.length);

            const testPixel = new Uint16Array(upper_bit_arr.length);

            // TODO: testPixel　が正しいかをみる
            for (let i = 0; i < upper_bit_arr.length; i += 1) {
                testPixel[i] = (upper_bit_arr[i] << 8) + lower_bit_arr[i];
            }
            pointCloudScene.updateTexture(testPixel);

            return;

            for (let i = 0; i < data.length; i += 4) {
                data[i] = upper_bit_arr[i / 2];          // r
                data[i + 1] = lower_bit_arr[i / 2];      // g
                data[i + 2] = upper_bit_arr[i / 2 + 1];  // b
                data[i + 3] = lower_bit_arr[i / 2 + 1];  // a
            }

            context.putImageData(img, 0, 0);

            const pixel: Uint8Array = new Uint8Array(data.buffer);
            const rawDepth: Uint16Array = new Uint16Array(depth.length / 2);
            const upper = new Uint8Array(depth.length / 2);
            const lower = new Uint8Array(depth.length / 2);

            for (let i = 0; i < pixel.length; i += 4) {
                let r = pixel[i];
                let g = pixel[i + 1];
                let b = pixel[i + 2];
                let a = pixel[i + 3];

                upper[i / 2] = r;
                lower[i / 2] = g;
                upper[i / 2 + 1] = b;
                lower[i / 2 + 1] = a;

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

            // pointCloudScene.updateTexture(rawDepth);
        });

        let redCanvas = document.createElement('canvas');
        redCanvas.width = 640;
        redCanvas.height = 480;
        redCanvas.id = 'goal';
        document.body.appendChild(redCanvas);
        let redContext = redCanvas.getContext('2d');
        let redImg = redContext.getImageData(0, 0, 640, 480);
        let redData = redImg.data;

        ipcRenderer.on('red', (ev, depth: Uint8Array) => {
            let j = 0;
            for (let i = 0; i < redData.length; i += 4) {
                redData[i] = depth[j];
                redData[i + 1] = 0;
                redData[i + 2] = 0;
                redData[i + 3] = 255;
                j += 1;
            }

            redContext.putImageData(redImg, 0, 0);
        });
    }

    private setupEvents = () => {
        document.getElementById('webrtcConnectButton').onclick = this.connect;
        document.getElementById('webrtcDisconnectButton').onclick = this.disconnect;

        window.document.onkeydown = (event) => {
            if (event.key == 's') {
                this.saveDepthPng();
            }
        };
    };

    private saveDepthPng = () => {
        const canvas = document.getElementById('depth_rgba') as HTMLCanvasElement;
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        const decode = dataUriToBuffer(dataUrl);
        fs.writeFile('./test.png', decode, (err) => {
            if (err) {
                console.log(err);
            }
        });
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