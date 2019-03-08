import { PixelConverter } from "../../pixel_converter/pixel_converter";

interface CanvasData {
    context: CanvasRenderingContext2D;
    img: ImageData;
    pixel: Uint8ClampedArray;
}

export class RealsenseGateway {

    private pixelConverter: PixelConverter;
    private depthCanvasData: CanvasData;
    private checkCanvasData: CanvasData;
    private colorCanvasData: CanvasData;
    public onRawDepthUpdated: (rawDepth: Uint16Array) => void;
    public DepthCanvas = () => {
        return this.depthCanvasData.context.canvas;
    }
    public ColorCanvas = () => {
        return this.colorCanvasData.context.canvas;
    }


    constructor(showDepthCanvas: boolean, showCheckCanvas: boolean, showColorCanvas: boolean) {
        this.pixelConverter = new PixelConverter();

        // depth canvas
        let depthCanvas = document.createElement('canvas');
        depthCanvas.id = 'depth_rgba';
        depthCanvas.width = 512;
        depthCanvas.height = 400;
        this.depthCanvasData = this.canvasToCanvasData(depthCanvas);

        // check canvas
        let checkCanvas = document.createElement('canvas');
        checkCanvas.id = 'check_canvas';
        checkCanvas.width = 640;
        checkCanvas.height = 480;
        this.checkCanvasData = this.canvasToCanvasData(checkCanvas);

        // color canvas
        let colorCanvas = document.createElement('canvas');
        colorCanvas.id = 'color_canvas';
        colorCanvas.width = 640;
        colorCanvas.height = 480;
        this.colorCanvasData = this.canvasToCanvasData(colorCanvas);

        if (showDepthCanvas) {
            document.body.appendChild(depthCanvas);
        }
        if (showCheckCanvas) {
            document.body.appendChild(checkCanvas);
        }
        if (showColorCanvas) {
            document.body.appendChild(colorCanvas);
        }
    }

    private canvasToCanvasData = (canvas: HTMLCanvasElement) => {
        let context = canvas.getContext('2d');
        let img = context.getImageData(0, 0, canvas.width, canvas.height);
        let pixel = img.data;
        let data: CanvasData = {
            context: context,
            img: img,
            pixel: pixel
        }
        return data;
    };

    onDepthFrame = (event: any, upperAndLowerBits: Uint8Array) => {
        const upper_bit_arr = upperAndLowerBits.slice(0, upperAndLowerBits.length / 2);
        const lower_bit_arr = upperAndLowerBits.slice(upperAndLowerBits.length / 2, upperAndLowerBits.length);

        // convert depth to rgb 
        this.pixelConverter.depthToRGB(this.depthCanvasData.pixel, upper_bit_arr, lower_bit_arr);

        // draw it 
        this.depthCanvasData.context.clearRect(0, 0, this.depthCanvasData.context.canvas.width, this.depthCanvasData.context.canvas.height);
        this.depthCanvasData.context.putImageData(this.depthCanvasData.img, 0, 0);

        // get raw depth from canvas
        let getData = this.depthCanvasData.context.getImageData(0, 0, this.depthCanvasData.context.canvas.width, this.depthCanvasData.context.canvas.height).data;
        const pixel: Uint8Array = new Uint8Array(getData.buffer);

        // reconstruct depth
        let rawDepth: Uint16Array;
        const upper = new Uint8Array(upperAndLowerBits.length / 2);
        const lower = new Uint8Array(upperAndLowerBits.length / 2);
        rawDepth = this.pixelConverter.RGBtoRawDepth(pixel, upper, lower);

        if (this.onRawDepthUpdated) {
            this.onRawDepthUpdated(rawDepth);
        }

        this.pixelConverter.rawDepthToRed(this.checkCanvasData.pixel, rawDepth);
        this.checkCanvasData.context.putImageData(this.checkCanvasData.img, 0, 0);
    };

    onColorFlame = (event: any, color_pixel: Uint8Array) => {
        for (let i = 0, j = 0; i < this.colorCanvasData.pixel.length; i += 4, j += 3) {
            this.colorCanvasData.pixel[i] = color_pixel[j];
            this.colorCanvasData.pixel[i + 1] = color_pixel[j + 1];
            this.colorCanvasData.pixel[i + 2] = color_pixel[j + 2];
            this.colorCanvasData.pixel[i + 3] = 255;
        }
        this.colorCanvasData.context.putImageData(this.colorCanvasData.img, 0, 0);
    };
}