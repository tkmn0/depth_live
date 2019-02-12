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
import { read } from "fs";

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
            this.setupDepth();
            // this.streamer = new Streamer();
            // this.streamer.startSession({ video: true, audio: false, data: false });
            // this.streamer.delegate = this;
        } else {
            this.streamReader = new StreamReader();
            this.streamReader.getCanvas().width = 640;
            this.streamReader.getCanvas().height = 480;
            document.body.appendChild(this.streamReader.getCanvas());
        }
    }

    private setupDepth = async () => {
        let videoFrameAvailable = false;
        let depthStream = await DepthCamera.getDepthStream();
        let colorStream = await DepthCamera.getColorStreamForDepthStream(depthStream);
        let dpethVideo = document.createElement('video');
        dpethVideo.oncanplay = () => { videoFrameAvailable = true };
        dpethVideo.autoplay = true;
        dpethVideo.crossOrigin = "anonymous";
        dpethVideo.srcObject = depthStream;

        let colorVideo = document.createElement('video');
        colorVideo.srcObject = colorStream;
        colorVideo.autoplay = true;
        document.body.appendChild(colorVideo);

        let depthCanvas = document.createElement('canvas');
        depthCanvas.width = 640;
        depthCanvas.height = 480;
        document.body.appendChild(depthCanvas);

        let GL = this._configureGLContext(depthCanvas);
        let gl: WebGL2RenderingContext = GL.gl;

        let canvas = document.createElement('canvas');
        canvas.width = depthCanvas.width;
        canvas.height = depthCanvas.height;
        document.body.appendChild(canvas);
        let ctx = canvas.getContext('2d');
        let readFormat: number;

        setInterval(() => {
            if (videoFrameAvailable) {
                let frameBuffer = GL.framebuffer;

                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, GL.depth_texture)

                if (GL.color_buffer_float_ext) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, gl.RED, gl.FLOAT, dpethVideo);
                }

                // ======= Read Pixels
                let videowidth = depthCanvas.width;
                let videoHeight = depthCanvas.height;
                // Bind the framebuffer the texture is color-attached to.
                gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
                if (!this.readBuffer) {
                    readFormat = gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_FORMAT);

                    if (readFormat == gl.RED && gl.getParameter(gl.IMPLEMENTATION_COLOR_READ_TYPE) == gl.FLOAT) {
                        this.readBuffer = new Float32Array(videowidth * videoHeight);
                        console.log('--- readFormat is:', 'gl.RED');
                    } else {
                        this.readBuffer = new Float32Array(videowidth * videoHeight * 4);
                        console.log('--- readFormat is:', 'gl.RGBA');
                    }
                }
                gl.readPixels(0, 0, videowidth, videoHeight, readFormat, gl.FLOAT, this.readBuffer, 0);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);

                // ======= Draw RGBA
                const img = ctx.getImageData(0, 0, videowidth, videoHeight);
                const data = img.data;
                const stride = (readFormat === gl.RED) ? 1 : 4;
                for (let i = 0, j = 0; i < data.length; i += 4, j += stride) {
                    data[i] = this.readBuffer[j] * 255;
                    data[i + 3] = 255;
                }
                ctx.putImageData(img, 0, 0);

                // Show gray colored depth
                gl.bindBuffer(gl.ARRAY_BUFFER, GL.vertex_buffer);
                gl.vertexAttribPointer(GL.vertex_location, 2, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GL.index_buffer);
                gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
            }

        }, 1000 / 30);

    };

    // Creates WebGL/WebGL2 context used to upload depth video to texture,
    // read the pixels to Float buffer and optionElally render the texture.
    _configureGLContext(canvas: HTMLCanvasElement) {
        let gl: WebGL2RenderingContext = canvas.getContext("webgl2") as WebGL2RenderingContext;

        gl.getExtension('EXT_color_buffer_float');
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // Shaders and program are needed only if rendering depth texture.
        var vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertex_shader, `
          attribute vec2 v;
          varying vec2 t;
          void main(){
            gl_Position = vec4(v.x * 2.0 - 1.0, 1.0 - v.y * 2.0, 0, 1);
            t = v;
          }`);
        gl.compileShader(vertex_shader);
        var pixel_shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(pixel_shader, `
          precision mediump float;
          uniform sampler2D s;
          varying vec2 t;
          void main(){
            vec4 tex = texture2D(s, t) * vec4(10.0, 10.0, 10.0, 1.0);
            gl_FragColor = tex.rrra;
          }`);
        gl.compileShader(pixel_shader);
        var program = gl.createProgram();
        gl.attachShader(program, vertex_shader);
        gl.attachShader(program, pixel_shader);
        gl.linkProgram(program);
        gl.useProgram(program);
        var vertex_location = gl.getAttribLocation(program, "v");
        gl.enableVertexAttribArray(vertex_location);
        gl.uniform1i(gl.getUniformLocation(program, "s"), 0);
        var vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), gl.STATIC_DRAW);
        var index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
        var depth_texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, depth_texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // Framebuffer for reading back the texture.
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, depth_texture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        let color_buffer_float_ext = true;
        return { gl, vertex_buffer, vertex_location, index_buffer, depth_texture, framebuffer, color_buffer_float_ext };
    }


    private setupDepthTexture = (depth: HTMLCanvasElement) => {
        let gl = depth.getContext('webgl') as WebGLRenderingContext;
        let depthTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        // Create a framebuffer for reading back the texture. Bind the texture to it as color attachment.
        var framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, depthTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { gl, depthTexture };
    };


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