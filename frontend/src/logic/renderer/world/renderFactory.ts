import {TerrainRenderLayer} from "./terrainRenderLayer";
import {RenderWorld} from "./renderWorld";

import SHADER_SRC_TILEMAP_VERT from "../../../logic/renderer/mapShader.vsh?raw";
import SHADER_SRC_TILEMAP_FRAG from "../../../logic/renderer/mapShader.fsh?raw";
import {GLProgram} from "../common/glProgram";
import {GLTexture} from "../common/glTexture";

export namespace RenderWorldFactory {

    export function createWorld(gl: WebGL2RenderingContext): RenderWorld {
        return new RenderWorld([
            createTerrainLayer(gl),
        ]);
    }

    function createTerrainLayer(gl: WebGL2RenderingContext): TerrainRenderLayer {
        const program = GLProgram.create(gl, SHADER_SRC_TILEMAP_VERT, SHADER_SRC_TILEMAP_FRAG);
        const tileset = GLTexture.createFromPath(gl, "/tileset.png");
        return new TerrainRenderLayer(program, tileset);
    }

}