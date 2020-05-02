import * as chroma from "chroma-js";

export const Colors = {
    background: 'black',
    boundingBox: 'yellow',
    cellColorRange: chroma.bezier(['#220000', '#aaa000', '#00ff00']),
} as const;

export class ColorRange {

}
