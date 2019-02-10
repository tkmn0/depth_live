import { Channels } from "../models/channels";
import { setInterval } from "timers";
import { StreamerDelegate } from "./streamer_delegate";

export class Streamer {

    private videoElement: HTMLVideoElement
    private colorCanvas: HTMLCanvasElement
    private currentBlob: Blob
    private fileReader = new FileReader();
    delegate: StreamerDelegate
    private isReading = false;

    constructor() {
        this.videoElement = document.createElement('video');
        this.videoElement.id = 'colorVideo';
        this.colorCanvas = document.createElement('canvas');
        this.colorCanvas.id = 'colorCanvas';
        document.body.appendChild(this.colorCanvas);

        setInterval(() => { this.drawToCanvas(this.videoElement, this.colorCanvas) }, 1000 / 30);
        setInterval(() => { this.colorCanvas.toBlob((blob) => { this.currentBlob = blob }, 'image/webp', 1.0) }, 1000 / 30);
        setInterval(() => { this.readBlob(this.currentBlob) }, 1000 / 30);
    }

    public startSession = async (channels: Channels) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: channels.video, audio: channels.audio });
            this.videoElement.srcObject = stream;
            await this.videoElement.play();
        } catch (err) {
            console.log(err);
        }
    };

    private drawToCanvas = (video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    };

    private readBlob = (blob: Blob) => {
        if (blob && blob.size > 0 && !this.isReading) {
            let offset = 0;
            const chunkSize = 16384;

            this.fileReader.onload = (event) => {
                const readBytes = this.fileReader.result as ArrayBuffer

                if (this.delegate && this.delegate.readBytes) {
                    this.delegate.readBytes(readBytes);
                }

                offset += readBytes.byteLength;
                if (offset < blob.size) {
                    readSlice(offset);
                } else {
                    if (this.delegate && this.delegate.readDone) {
                        this.delegate.readDone();
                        this.isReading = false;
                    }
                }
            };

            const readSlice = (o) => {
                const slice = blob.slice(offset, o + chunkSize);
                this.fileReader.readAsArrayBuffer(slice);
            };

            if (this.delegate && this.delegate.readStart) {
                this.delegate.readStart(blob.size);
                this.isReading = true;
            }
            readSlice(0);
        }
    };

}