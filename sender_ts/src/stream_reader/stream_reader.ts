
export class StreamReader {

    private chunks: ArrayBuffer[]
    private image: HTMLImageElement
    private canvas: HTMLCanvasElement
    private reading: boolean = false

    constructor() {
        this.image = document.createElement('img');
        this.canvas = document.createElement('canvas');

        setInterval(this.drawCanvas, 1000 / 30);
    }

    public getCanvas = (): HTMLCanvasElement => {
        return this.canvas;
    };

    private drawCanvas = () => {
        this.canvas.getContext('2d').drawImage(this.image, 0, 0);
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