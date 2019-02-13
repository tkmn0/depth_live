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
        this.signalingGateway = new WebSocketClient();
        this.signling = new Signling(this.signalingGateway, this.webRTCClient);
        this.webRTCClient.signalingDelegate = this.signling;
        this.signalingGateway.onSignalingMessage = this.signling.onSignalingMessage;

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

        let videowidth = 640 / 2, videoHeight = 480 / 4;
        let testCanvas = document.createElement('canvas');
        testCanvas.width = videowidth;
        testCanvas.height = videoHeight;
        document.body.appendChild(testCanvas);
        let context = testCanvas.getContext('2d');
        const img = context.getImageData(0, 0, videowidth, videoHeight);
        const data = img.data;

        let checkCanvas = document.createElement('canvas');
        checkCanvas.width = 640;
        checkCanvas.height = 480;
        document.body.appendChild(checkCanvas);
        let checkContext = checkCanvas.getContext('2d');
        let checkImage = checkContext.getImageData(0, 0, 640, 480);
        let checkData = checkImage.data;

        // raw depth length: 307200 // 16bit
        // depth length: 614400 // upper 8bit + lower 8bit
        // rgba 32bit (8, 8, 8, 8) => color 1px depth 2px
        // color_webp_length => raw depth length /2
        // 640 * 480 / 2 

        ipcRenderer.on('depth', (event, depth: Uint8Array) => {

            const upper_bit_arr = depth.slice(0, depth.length / 2);
            const lower_bit_arr = depth.slice(depth.length / 2, depth.length);

            /*
            for (let i = 0; i < data.length; i += 2) {
                data[i] = upper_bit_arr[i];    // r, b
                data[i + 1] = lower_bit_arr[i]; // g, a
            }
            */
            for (let i = 0; i < data.length; i += 4) {
                data[i] = upper_bit_arr[i / 4];          // r
                data[i + 1] = lower_bit_arr[i / 4];      // g
                data[i + 2] = upper_bit_arr[i / 4 + 1];  // b
                data[i + 3] = lower_bit_arr[i / 4 + 1];  // a
            }

            context.putImageData(img, 0, 0);

            const pixel: Uint8Array = new Uint8Array(data.buffer);
            const rawDepth: Uint16Array = new Uint16Array(depth.length / 2);

            /*
            for (let i = 0; i < pixel.length; i += 4) {
                rawDepth[i] = (pixel[i] << 8) + pixel[i + 1];
                rawDepth[i + 1] = (pixel[i + 2] << 8) + pixel[i + 3];
            }
            */


            console.log('pixel length:', pixel.length); // 153600 (8, 8, 8, 8)bit
            console.log('rawdepth length:', rawDepth.length); // 307200 (16)bit

            let upper = new Uint8Array(depth.length / 2);
            let lower = new Uint8Array(depth.length / 2);

            for (let i = 0; i < pixel.length; i += 4) {
                let r = pixel[i];
                let g = pixel[i + 1];
                let b = pixel[i + 2];
                let a = pixel[i + 3];

                // first = r + g;
                // secont = b + a;

                /*
                rawDepth[i / 4] = (r << 8) + g;
                rawDepth[i / 4 + 1] = (b << 8) + a;
                */
                upper[i / 2] = r;
                upper[i / 2 + 1] = g;
                lower[i / 2] = b;
                lower[i / 2 + 1] = a;
            }

            /*
            for (let i = 0; i < rawDepth.length, i += 2;) {
    
                
                let r = pixel[i * 2];
                let g = pixel[i * 2 + 1];
                let b = pixel[i * 2 + 2];
                let a = pixel[i * 2 + 3];
                rawDepth[i] = (r << 8) + g;
                rawDepth[i + 1] = (b << 8) + a;
                
            }
            */

            let j = 0;
            for (let i = 0; i < checkData.length; i += 4) {
                let red = rawDepth[j] % 256;
                checkData[i] = red;
                checkData[i + 1] = 0;
                checkData[i + 2] = 0;
                checkData[i + 3] = 0xff;
                j += 1;
            }

            checkContext.putImageData(checkImage, 0, 0);

        });
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