'use strict';

class Picture {

    constructor(px, py, w, h, impath, cat) {
        this.posx = px; // X-coordinate of the picture
        this.posy = py; // Y-coordinate of the picture
        this.w = w;     // Width of the picture
        this.h = h;     // Height of the picture
        this.impath = impath; // Path to the image file
        this.imgobj = new Image(); // Image object
        this.imgobj.src = this.impath; // Set the image source
        this.original_w = this.imgobj.width; // Original width of the image
        this.original_h = this.imgobj.height; // Original height of the image
        this.category = cat; // Category of the picture
        this.hist = []; // Array to store histogram data
        this.color_moments = []; // Array to store color moments data
        this.manhattanDist = []; // Array to store Manhattan distances
    }

    draw(cnv) {
        let ctx = cnv.getContext("2d");

        if (this.imgobj.complete) {
            ctx.drawImage(this.imgobj, this.posx, this.posy, this.w, this.h);
            console.log("Debug: N Time");
        } else {
            console.log("Debug: First Time");
            let self = this;
            this.imgobj.addEventListener('load', function () {
                ctx.drawImage(self.imgobj, self.posx, self.posy, self.w, self.h);
            }, false);
        }
    }

    computation(cnv, histcol, colorMom, eventP) {
        const ctx = cnv.getContext("2d", { willReadFrequently: true });
        const self = this;
        const computation2 = function () {
            ctx.drawImage(self.imgobj, 0, 0, self.imgobj.width, self.imgobj.height);
            const pixels = ctx.getImageData(0, 0, self.imgobj.width, self.imgobj.height);
            self.hist = histcol.count_Pixels(pixels.data);
            document.dispatchEvent(eventP);
        }
        if (this.imgobj.complete) {
            console.log("Debug: N Time");
            computation2();
        } else {
            console.log("Debug: First Time");
            this.imgobj.addEventListener('load', computation2, false);
        }
    }

    build_Color_Rect(cnv, hist, redColor, greenColor, blueColor) {
        const ctx = cnv.getContext("2d");
        const text_y = 390;
        const rect_y = 400;
        const hor_space = 80;

        ctx.font = "12px Arial";
        for (let c = 0; c < redColor.length; c++) {
            ctx.fillStyle = "rgb(" + redColor[c] + "," + greenColor[c] + "," + blueColor[c] + ")";
            ctx.fillRect(c * hor_space, rect_y, 50, 50);
            if (c === 8) {
                ctx.fillStyle = "black";
            }
            ctx.fillText(hist[c], c * hor_space, text_y);
        }
    }

    setPosition(px, py) {
        this.posx = px;
        this.posy = py;
    }

    mouseOver(mx, my) {
        if ((mx >= this.posx) && (mx <= (this.posx + this.w)) && (my >= this.posy) && (my <= (this.posy + this.h))) {
            return true;
        }
        return false;
    }
}

class ColorHistogram {

    constructor(redColor, greenColor, blueColor) {
        this.redColor = redColor; // Array representing red color values
        this.greenColor = greenColor; // Array representing green color values
        this.blueColor = blueColor; // Array representing blue color values
    }

    count_Pixels(pixels) {
        const arrayColors = Array(12).fill(0);
        let limiar1;
        let limiar2;

        for (let i = 0; i < pixels.length; i += 4) { //precorrer os pixels
            const r = pixels[i];
            const g = pixels[i + 1];  //armazena os valores de RGB para cada pixel, a saturação não irá ser verificada 
            const b = pixels[i + 2];
            for (let j = 0; j < this.redColor.length; j++) {
                if (j >= 8) {
                    limiar1 = 100 
                    limiar2 = 20
                }
                else{   //limiares diferentes pois as cores como o preto e castanho sao mais "fáceis" de verificar 
                    limiar1 = 100 
                    limiar2 = 50
                }
                const redCheck = Math.abs(r - this.redColor[j]); 
                const greenCheck = Math.abs(g - this.greenColor[j]);  //calcular as distâncias
                const blueCheck = Math.abs(b - this.blueColor[j]); 
                const manhattanDistance = redCheck + greenCheck + blueCheck;

                if(manhattanDistance < limiar1 && redCheck < limiar2 && greenCheck < limiar2 && blueCheck < limiar2){   //testar as distâncias com os limiares 
                    arrayColors[j] += 1;
                }
            }
        }
        return arrayColors;
    }
}

class ColorMoments {

    constructor() {
        this.h_block = 3; // Number of horizontal blocks
        this.v_block = 3; // Number of vertical blocks
    }

    rgbToHsv(rc, gc, bc) {
        // Convert RGB values to the HSV color space
        // This method returns an array representing the [h, s, v] values in the HSV color space
        let r = rc / 255;
        let g = gc / 255;
        let b = bc / 255;

        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let h = null, s = null, v = max;

        let dif = max - min;
        s = max == 0 ? 0 : dif / max;

        if (max == min) {
            h = 0;
        } else {
            switch (max) {
                case r:
                    h = (g - b) / dif + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / dif + 2;
                    break;
                case b:
                    h = (r - g) / dif + 4;
                    break;
            }
            h /= 6;
        }
        return [h, s, v];
    }

    /**
     * Calculates the color moments of an image.
     * @param {HTMLImageElement} imgobj - The image to calculate the color moments from.
     * @param {HTMLCanvasElement} cnv - The canvas element to draw the image on.
     * @returns {Array} An array containing the computed color moments.
     */
    moments(imgobj, cnv) {
        // Calculate the dimensions of each block
        const wBlock = Math.floor(imgobj.width / this.h_block);
        const hBlock = Math.floor(imgobj.height / this.v_block);

        // Calculate the total number of blocks
        const n = this.h_block * this.v_block;

        // Array to store the computed color moments
        const descriptor = [];

        // Get the 2D rendering context of the canvas
        let ctx = cnv.getContext("2d");
        // Draw the image on the canvas
        ctx.drawImage(imgobj, 0, 0);

        // this method should be completed by the students

        return descriptor;
    }
}
