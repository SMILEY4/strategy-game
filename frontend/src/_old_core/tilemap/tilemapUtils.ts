import {TilePosition} from "../models/tilePosition";

export namespace TilemapUtils {

    export function hexCoordinateS(pos: TilePosition): number {
        return -pos.q - pos.r;
    }

    export class HexOrientation {
        public readonly f0: number;
        public readonly f1: number;
        public readonly f2: number;
        public readonly f3: number;
        public readonly b0: number;
        public readonly b1: number;
        public readonly b2: number;
        public readonly b3: number;
        public readonly startAngle: number;


        constructor(f0: number, f1: number, f2: number, f3: number, b0: number, b1: number, b2: number, b3: number, startAngle: number) {
            this.f0 = f0;
            this.f1 = f1;
            this.f2 = f2;
            this.f3 = f3;
            this.b0 = b0;
            this.b1 = b1;
            this.b2 = b2;
            this.b3 = b3;
            this.startAngle = startAngle;
        }

        public static POINTY_TOP: HexOrientation = new HexOrientation(
            Math.sqrt(3), Math.sqrt(3) / 2, 0, 3 / 2,
            Math.sqrt(3) / 3, -1 / 3, 0, 2 / 3,
            0.5,
        );

        public static FLAT_TOP: HexOrientation = new HexOrientation(
            3 / 2, 0, Math.sqrt(3) / 2, Math.sqrt(3),
            2 / 3, 0, -1 / 3, Math.sqrt(3) / 3,
            0,
        );

    }


    export class HexLayout {
        public readonly orientation: HexOrientation;
        public readonly size: [number, number];
        public readonly origin: [number, number];

        constructor(orientation: HexOrientation, size: [number, number], origin: [number, number]) {
            this.orientation = orientation;
            this.size = size;
            this.origin = origin;
        }

        public static build(type: "pointy-top" | "flat-top", size: number | number[], originX: number, originY: number) {
            return new HexLayout(
                type === "pointy-top" ? HexOrientation.POINTY_TOP : HexOrientation.FLAT_TOP,
                [Array.isArray(size) ? size[0] : size, Array.isArray(size) ? size[1] : size],
                [originX, originY],
            );
        }
    }

    export const DEFAULT_HEX_LAYOUT = HexLayout.build("pointy-top", [10, 10], 0, 0);

    export function hexToPixel(layout: TilemapUtils.HexLayout, q: number, r: number): [number, number] {
        const M = layout.orientation;
        const x = (M.f0 * q + M.f1 * r) * (layout.size[0]);
        const y = (M.f2 * q + M.f3 * r) * (layout.size[1]);
        return [
            x + layout.origin[0],
            y + layout.origin[1],
        ];
    }


}