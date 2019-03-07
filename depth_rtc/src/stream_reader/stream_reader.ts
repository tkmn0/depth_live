export class StreamReader {

    private chunks: ArrayBuffer[]
    private image: HTMLImageElement
    private canvas: HTMLCanvasElement
    private reading: boolean = false
    public onRawDepthUpdated: (pixels: Uint8Array) => void;

    constructor() {
        this.image = document.createElement('img');
        this.image.id = "test";
        this.image.width = 512;
        this.image.height = 400;
        this.image.crossOrigin = "Anonymous";
        document.body.appendChild(this.image);
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.canvas.id = "reader";
        this.canvas.width = 512;
        this.canvas.height = 400;
        let context = this.canvas.getContext('2d');

        this.image.onload = (event) => {
            context.clearRect(0, 0, this.image.width, this.image.height);
            context.drawImage(this.image, 0, 0);
            if (this.onRawDepthUpdated) {
                let data = context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                this.onRawDepthUpdated(new Uint8Array(data.data.buffer));
            }
        };
    }

    public getCanvas = (): HTMLCanvasElement => {
        return this.canvas;
    };

    public read = (buffer: ArrayBuffer) => {
        if (buffer.byteLength == 1) {
            let slice = buffer.slice(0);
            let arr = new Int8Array(slice);
            if (arr[0] === -1) {
                this.readStart();
                this.reading = true;
            } else if (arr[0] === -2) {
                this.readDone();
                this.reading = false;
            }
        } else {
            if (this.reading) {
                this.readBytes(buffer);
            }
        }
    };

    private readStart = () => {
        this.chunks = new Array();
    };

    private readBytes = (chunk: ArrayBuffer) => {
        this.chunks.push(chunk);
    };

    private readDone = () => {
        if (this.chunks && this.chunks.length > 0) {
            const blob = new Blob(this.chunks, { type: 'image/webp' });
            this.image.src = URL.createObjectURL(blob);
        }
    };
}