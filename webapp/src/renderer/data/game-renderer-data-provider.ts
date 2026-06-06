import type {RenderCameraData, RenderTile} from "@/renderer/data/models.ts";
import {HexUtils} from "@/common/hexUtils.ts";
import {vec3} from "gl-matrix";

export class GameRendererDataProvider {

    private readonly mapRadius: number;
    private readonly chunkRadius: number = 40;
    private readonly tiles: RenderTile[];
    private camera: RenderCameraData = {
        revId: 0,
        up: vec3.fromValues(0, 1, 0),
        position: vec3.fromValues(-50, 40, 0),
        direction: vec3.fromValues(2, -1, 0),
        fov: 50,
        near: 0.01,
        far: 1000,
        aspect: 1,
    };

    constructor(mapRadius: number) {
        this.tiles = HexUtils.generateTiles(mapRadius);
        this.mapRadius = mapRadius;
    }

    public updateCamera(func: (camera: RenderCameraData) => void) {
        const next = {...this.camera}
        func(next);
        next.revId++;
        this.camera = next;
    }

    public getTiles(): RenderTile[] {
        return this.tiles;
    }

    public getCamera(): RenderCameraData {
        return this.camera;
    }

    public getMapRadius(): number {
        return this.mapRadius;
    }

    public getChunkRadius(): number {
        return this.chunkRadius;
    }

}