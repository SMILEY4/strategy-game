import {RenderEntity} from "../entities/renderEntity";
import {MapMode} from "../../../../models/mapMode";
import {Stamp} from "./stamp";
import {Camera} from "../../../../shared/webgl/camera";
import {TileIdentifier} from "../../../../models/tile";
import {TilemapUtils} from "../../../../logic/game/tilemapUtils";
import {mat3} from "../../../../shared/webgl/mat3";
import {TileDatabase} from "../../../../state_new/tileDatabase";

export namespace StampBuilder {

    const LABEL_OFFSET: [number, number] = [0, -TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 0.7];
    const ICON_OFFSET: [number, number] = [0, 0];


    export function build(camera: Camera, entities: RenderEntity[], tileDb: TileDatabase, mapMode: MapMode): Stamp[] {

        const tiles = tileDb.queryMany(TileDatabase.QUERY_ALL, null);
        const canvasSize: [number, number] = [camera.getClientWidth(), camera.getClientHeight()];

        const stamps: Stamp[] = [];

        for (let i = 0, n = entities.length; i < n; i++) {
            const entity = entities[i];
            if (entity.label) {
                const pos = getAbsolutePosition(entity.tile, camera, canvasSize, LABEL_OFFSET);
                if (isVisible(pos, canvasSize)) {
                    stamps.push({
                        type: "text",
                        content: entity.label,
                        screenX: pos[0],
                        screenY: pos[1],
                    });
                }
            }
        }

        if (mapMode === MapMode.RESOURCES && camera.getZoom() > 2) {
            for (let i = 0, n = tiles.length; i < n; i++) {
                const tile = tiles[i];
                if (tile.resourceType !== null) {
                    const pos = getAbsolutePosition(tile.identifier, camera, canvasSize, ICON_OFFSET);
                    if (isVisible(pos, canvasSize)) {
                        stamps.push({
                            type: "icon",
                            content: tile.resourceType.icon,
                            screenX: pos[0],
                            screenY: pos[1],
                        });
                    }
                }
            }
        }

        return stamps;
    }

    function getAbsolutePosition(tile: TileIdentifier, camera: Camera, canvasSize: [number, number], offset: [number, number]): [number, number] {
        let worldPos = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, tile.q, tile.r);
        worldPos = [worldPos[0] + offset[0], worldPos[1] + offset[1]];

        const matrix = camera.getViewProjectionMatrixOrThrow();
        const viewPos = mat3.transformPoint(matrix, worldPos);

        return [
            (viewPos[0] + 1.0) / 2 * canvasSize[0],
            canvasSize[1] - (viewPos[1] + 1.0) / 2 * canvasSize[1],
        ];
    }

    function isVisible(pos: [number, number], canvasSize: [number, number]): boolean {
        const padding = 100;
        return (-padding <= pos[0] && pos[0] <= canvasSize[0] + padding)
            && (-padding <= pos[1] && pos[1] <= canvasSize[1] + padding);
    }

}