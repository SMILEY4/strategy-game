export interface GameRenderConfig {
    water: {
        colorLight: [number, number, number],
        colorDark: [number, number, number]
    };
    land: {
        colorLight: [number, number, number],
        colorDark: [number, number, number]
    }
}


export namespace GameRenderConfig {

    export function initialize() {
        set("cfg-water-color-light", "#a5c0c5");
        set("cfg-water-color-dark", "#7995ae");
        set("cfg-land-color-light", "#949b64");
        set("cfg-land-color-dark", "#747e57");
    }

    export function load(): GameRenderConfig {
        return {
            water: {
                colorLight: hexToRgb(get("cfg-water-color-light")),
                colorDark: hexToRgb(get("cfg-water-color-dark")),
            },
            land: {
                colorLight: hexToRgb(get("cfg-land-color-light")),
                colorDark: hexToRgb(get("cfg-land-color-dark")),
            },
        };
    }

    function get(name: string) {
        return getComputedStyle(document.documentElement)
            .getPropertyValue("--" + name);
    }

    function set(name: string, value: string) {
        document.documentElement.style
            .setProperty("--" + name, value);
    }

    function hexToRgb(hex: string): [number, number, number] {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16) / 255,
            parseInt(result[2], 16) / 255,
            parseInt(result[3], 16) / 255,
        ] : [0, 0, 0];
    }

    function rgbToHex(r: number, g: number, b: number) {

        function componentToHex(c: number) {
            const hex = (Math.floor(c*255)).toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        }

        return "#" + componentToHex(r*255) + componentToHex(g) + componentToHex(b);
    }

}