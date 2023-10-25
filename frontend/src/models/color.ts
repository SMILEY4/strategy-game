export interface Color {
    red: number,
    green: number,
    blue: number
}

export namespace Color {

    export const BLACK: Color = {
        red: 0, // [0-255]
        green: 0, // [0-255]
        blue: 0, // [0-255]
    };

    export const BLACK_PACKED = packRGB(BLACK)

    export function colorToRgbArray(color: Color): number[] {
        return [color.red / 255, color.blue / 255, color.green / 255];
    }

    export function colorToRgbaArray(color: Color, alpha: number): number[] {
        return [color.red / 255, color.blue / 255, color.green / 255, alpha];
    }

    // rgb must be in 0-255 (https://stackoverflow.com/questions/6893302/decode-rgb-value-to-single-float-without-bit-shift-in-glsl)
    export function packRGB(color: Color): number {
        return color.red + color.green * 256 + color.blue * 256 * 256;
    }

}