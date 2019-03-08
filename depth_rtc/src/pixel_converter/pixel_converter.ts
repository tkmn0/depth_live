export class PixelConverter {

    reconstructRawDepthFrom = (upperBits: Uint8Array, lowerBits: Uint8Array) => {
        let rawDepth = new Uint16Array(upperBits.length);
        for (let i = 0; i < upperBits.length; i += 1) {
            rawDepth[i] = (upperBits[i] << 8) + lowerBits[i];
        }
        return rawDepth;
    };

    depthToRGB = (pixel: Uint8ClampedArray, upperBits: Uint8Array, lowerBits: Uint8Array) => {

        for (let i = 0, d = 0; i < pixel.length; i += 8, d += 3) {
            // 2px (8, 8, 8, - ) x 2 bit 48 bit
            // depth 3px 48bit 
            // 640 x 480 x 2/3 におさまる
            pixel[i] = upperBits[d];         // 0 // 3 // 6
            pixel[i + 1] = lowerBits[d];     // 0 // 3 // 6 
            pixel[i + 2] = upperBits[d + 1]; // 1 // 4 // 7
            pixel[i + 3] = 255;
            pixel[i + 4] = lowerBits[d + 1]; // 1 // 4 // 7
            pixel[i + 5] = upperBits[d + 2]; // 2 // 5 // 8
            pixel[i + 6] = lowerBits[d + 2]; // 2 // 5 // 8
            pixel[i + 7] = 255;
        }
    };

    RGBtoRawDepth = (pixel: Uint8Array, upperBits: Uint8Array, lowerBits: Uint8Array) => {
        for (let i = 0, d = 0; i < pixel.length; i += 8, d += 3) {
            let r_1 = pixel[i];
            let g_1 = pixel[i + 1];
            let b_1 = pixel[i + 2];
            let a_1 = pixel[i + 3];
            let r_2 = pixel[i + 4];
            let g_2 = pixel[i + 5];
            let b_2 = pixel[i + 6];
            let a_2 = pixel[i + 7];
            upperBits[d] = r_1;
            lowerBits[d] = g_1;
            upperBits[d + 1] = b_1;
            lowerBits[d + 1] = r_2;
            upperBits[d + 2] = g_2;
            lowerBits[d + 2] = b_2;
        }

        return this.reconstructRawDepthFrom(upperBits, lowerBits);
    };

    rawDepthToRed = (pixel: Uint8ClampedArray, rawDepth: Uint16Array) => {
        let j = 0;
        for (let i = 0; i < pixel.length; i += 4) {
            let red = rawDepth[j] % 256;
            pixel[i] = red;
            pixel[i + 1] = 0;
            pixel[i + 2] = 0;
            pixel[i + 3] = 255;
            j += 1;
        }
    };
}