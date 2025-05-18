import {mat3} from "./mat3";
import {TilemapUtils} from "../tilemapUtils";
import {Camera} from "./camera";
import HexLayout = TilemapUtils.HexLayout;
import Point = Projections.Point;

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

    export function hexToScreen(camera: Camera, q: number, r: number, worldOffset?: [number, number]): Point {
        const worldPos = hexToWorld(q, r);
        if(worldOffset) {
            worldPos.x += worldOffset[0];
            worldPos.y += worldOffset[1];
        }
        const clipPos = worldToClip(camera, worldPos.x, worldPos.y);
        return clipToScreen(camera, clipPos.x, clipPos.y)
    }

}


export class TilemapProjection {

    constructor(private readonly layout: HexLayout) {}

    /**
     * transforms the given xy-screen-position (in range [0,size]) to clip-space (in range [-1,+1])
     */
    public screenToClip(camera: Camera, screenX: number, screenY: number): Point {
        return {
            x: (screenX / camera.getClientWidth()) * 2.0 - 1.0,
            y: ((camera.getClientHeight() - screenY) / camera.getClientHeight()) * 2.0 - 1.0,
        };
    }

    public clipToScreen(camera: Camera, clipX: number, clipY: number): Point {
        return {
            x: (clipX + 1) / 2 * camera.getClientWidth(),
            y: (clipY + 1) / 2 * camera.getClientHeight()
        }
    }

    /**
     * transforms the given xy-clipspace-position (in range (in range [-1,+1]) to world coordinates (in range [minWorld,maxWorld])
     */
    public clipToWorld(camera: Camera, clipX: number, clipY: number): Point {
        const invViewProjMatrix = mat3.inverse(camera.getViewProjectionMatrixOrThrow()); // todo: compute & store inv matrix at camera ?
        const pos = mat3.transformPoint(invViewProjMatrix, [clipX, clipY]);
        return {x: pos[0], y: pos[1]};
    }

    /**
     * transforms the given xy-world-position (in range [minWorld,maxWorld]) to qr-hex-position
     */
    public worldToHex(worldX: number, worldY: number): Point {
        const pos = TilemapUtils.pixelToHex(this.layout, [worldX, worldY]);
        return {x: pos[0], y: pos[1]};

    }

    /**
     * transforms the given qr-hex-position to xy-world-position (in range [minWorld,maxWorld])
     */
    public hexToWorld(q: number, r: number): Point {
        const pos = TilemapUtils.hexToPixel(this.layout, q, r);
        return {x: pos[0], y: pos[1]};
    }

    /**
     * transforms the given xy-screen-position (in range [0,size]) to world coordinates (in range [minWorld,maxWorld])
     */
    public screenToWorld(camera: Camera, screenX: number, screenY: number): Point {
        const clipPos = this.screenToClip(camera, screenX, screenY);
        return this.clipToWorld(camera, clipPos.x, clipPos.y);
    }

    public worldToClip(camera: Camera, worldX: number, worldY: number): Point {
        const pos =  mat3.transformPoint(camera.getViewProjectionMatrixOrThrow(), [worldX, worldY])
        return {x: pos[0], y: pos[1]};
    }

    /**
     * transforms the given xy-screen-position (in range [0,size]) to qr-hex-position
     */
    public screenToHex(camera: Camera, screenX: number, screenY: number): Point {
        const clipPos = this.screenToClip(camera, screenX, screenY);
        const worldPos = this.clipToWorld(camera, clipPos.x, clipPos.y);
        return this.worldToHex(worldPos.x, worldPos.y);
    }

    public hexToScreen(camera: Camera, q: number, r: number, worldOffset?: [number, number]): Point {
        const worldPos = this.hexToWorld(q, r);
        if(worldOffset) {
            worldPos.x += worldOffset[0];
            worldPos.y += worldOffset[1];
        }
        const clipPos = this.worldToClip(camera, worldPos.x, worldPos.y);
        return this.clipToScreen(camera, clipPos.x, clipPos.y)
    }

}