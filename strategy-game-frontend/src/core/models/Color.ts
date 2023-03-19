export interface Color {
    red: number,
    green: number,
    blue: number
}

export namespace Color {

    export const BLACK: Color = {
        red: 0,
        green: 0,
        blue: 0
    };

    export const INVALID: Color = {
        red: -255,
        green: -255,
        blue: -255
    };

    export function colorToRgbArray(color: Color): number[] {
        return [color.red / 255, color.blue / 255, color.green / 255];
    }

    export function colorToRgbaArray(color: Color, alpha: number): number[] {
        return [color.red / 255, color.blue / 255, color.green / 255, alpha];
    }

}