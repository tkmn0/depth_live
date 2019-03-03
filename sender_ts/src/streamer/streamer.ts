import { Channels } from "../models/channels";
import { StreamerDelegate } from "./streamer_delegate";

export class Streamer {

    private targetCanvas: HTMLCanvasElement
    private currentBlob: Blob
    private fileReader = new FileReader();
    delegate: StreamerDelegate
    private isReading = false;

    constructor() {

        setInterval(() => {
            if (this.targetCanvas) {
                this.targetCanvas.toBlob((blob) => { this.currentBlob = blob }, 'image/webp', 1.0);
            }
        }, 1000 / 30);

        setInterval(() => {
            this.readBlob(this.currentBlob)
        }, 1000 / 30);
    }

    public setTargetCanvas = (canvas: HTMLCanvasElement) => {
        this.targetCanvas = canvas;
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