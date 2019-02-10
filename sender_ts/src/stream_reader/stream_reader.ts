
export class StreamReader {

    private chunks: ArrayBuffer[]
    private image: HTMLImageElement
    private canvas: HTMLCanvasElement

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

    public readStart = () => {
        this.chunks = new Array();
    };

    public readBytes = (chunk: ArrayBuffer) => {
        this.chunks.push(chunk);
    };

    public readDone = () => {
        const blob = new Blob(this.chunks, { type: 'image/webp' });
        this.image.src = URL.createObjectURL(blob);
    };
}