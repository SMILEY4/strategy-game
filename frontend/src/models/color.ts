export interface Color {
    red: number, // [0-255]
    green: number, // [0-255]
    blue: number // [0-255]
}

export namespace Color {

    export const BLACK: Color = {
        red: 0,
        green: 0,
        blue: 0,
    };

    export const BLACK_PACKED = packRGB(BLACK);

    export function colorToRgbArray(color: Color): [number, number, number] {
        return [color.red / 255, color.green / 255, color.blue / 255];
    }

    export function colorToRgbaArray(color: Color, alpha: number): [number, number, number, number] {
        return [color.red / 255, color.green / 255, color.blue / 255, alpha];
    }

    // rgb must be in 0-255 (https://stackoverflow.com/questions/6893302/decode-rgb-value-to-single-float-without-bit-shift-in-glsl)
    export function packRGB(color: Color): number {
        return color.red + color.green * 256 + color.blue * 256 * 256;
    }

    export function toCss(color: Color): string {
        return "rgb(" + color.red + "," + color.green + "," + color.blue + ")"
    }

}