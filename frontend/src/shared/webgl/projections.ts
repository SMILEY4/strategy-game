import {mat3} from "./mat3";
import {TilemapUtils} from "../../logic/game/tilemapUtils";
import {Camera} from "./camera";

export namespace Projections {

    export interface Point {
        x: number,
        y: number
    }

    /**
     * transforms the given xy-screen-position (in range [0,size]) to clip-space (in range [-1,+1])
     */
    export function screenToClip(camera: Camera, screenX: number, screenY: number): Point {
        return {
            x: (screenX / camera.getClientWidth()) * 2.0 - 1.0,
            y: ((camera.getClientHeight() - screenY) / camera.getClientHeight()) * 2.0 - 1.0,
        };
    }

    export function clipToScreen(camera: Camera, clipX: number, clipY: number): Point {
        return {
            x: (clipX + 1) / 2 * camera.getClientWidth(),
            y: (clipY + 1) / 2 * camera.getClientHeight()
        }
    }

    /**
     * transforms the given xy-clipspace-position (in range (in range [-1,+1]) to world coordinates (in range [minWorld,maxWorld])
     */
    export function clipToWorld(camera: Camera, clipX: number, clipY: number): Point {
        const invViewProjMatrix = mat3.inverse(camera.getViewProjectionMatrixOrThrow()); // todo: compute & store inv matrix at camera ?
        const pos = mat3.transformPoint(invViewProjMatrix, [clipX, clipY]);
        return {x: pos[0], y: pos[1]};
    }

    /**
     * transforms the given xy-world-position (in range [minWorld,maxWorld]) to qr-hex-position
     */
    export function worldToHex(worldX: number, worldY: number): Point {
        const pos = TilemapUtils.pixelToHex(TilemapUtils.DEFAULT_HEX_LAYOUT, [worldX, worldY]);
        return {x: pos[0], y: pos[1]};

    }

    /**
     * transforms the given qr-hex-position to xy-world-position (in range [minWorld,maxWorld])
     */
    export function hexToWorld(q: number, r: number): Point {
        const pos = TilemapUtils.hexToPixel(TilemapUtils.DEFAULT_HEX_LAYOUT, q, r);
        return {x: pos[0], y: pos[1]};
    }

    /**
     * transforms the given xy-screen-position (in range [0,size]) to world coordinates (in range [minWorld,maxWorld])
     */
    export function screenToWorld(camera: Camera, screenX: number, screenY: number): Point {
        const clipPos = screenToClip(camera, screenX, screenY);
        return clipToWorld(camera, clipPos.x, clipPos.y);
    }

    export function worldToClip(camera: Camera, worldX: number, worldY: number): Point {
        const pos =  mat3.transformPoint(camera.getViewProjectionMatrixOrThrow(), [worldX, worldY])
        return {x: pos[0], y: pos[1]};
    }

    /**
     * transforms the given xy-screen-position (in range [0,size]) to qr-hex-position
     */
    export function screenToHex(camera: Camera, screenX: number, screenY: number): Point {
        const clipPos = screenToClip(camera, screenX, screenY);
        const worldPos = clipToWorld(camera, clipPos.x, clipPos.y);
        return worldToHex(worldPos.x, worldPos.y);
    }

    export function hexToScreen(camera: Camera, q: number, r: number): Point {
        const worldPos = hexToWorld(q, r);
        const clipPos = worldToClip(camera, worldPos.x, worldPos.y);
        return clipToScreen(camera, clipPos.x, clipPos.y)
    }

}