import type {RenderCameraData, RenderTile} from "@/renderer/data/models.ts";
import {HexUtils} from "@/common/hexUtils.ts";
import {vec3} from "gl-matrix";

export class GameRendererDataProvider {

    private readonly mapRadius: number;
    private readonly tileRadius: number = 2;
    private readonly chunkRadius: number = 10;
    private readonly tiles: RenderTile[];
    private camera: RenderCameraData = {
        revId: 0,
        up: vec3.fromValues(0, 1, 0),
        position: vec3.fromValues(0, 10, 0),
        direction: vec3.fromValues(1, 1, 0),
        fov: 50,
        near: 0.001,
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
        // console.log("camera", JSON.stringify({
        //     revId: this.camera.revId,
        //     position: this.camera.position,
        //     direction: this.camera.direction,
        //     aspect: this.camera.aspect,
        // }, null, 3));
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

    public getTileRadius(): number {
        return this.tileRadius;
    }

    public getChunkRadius(): number {
        return this.chunkRadius;
    }

}