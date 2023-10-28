import {TerrainRenderLayer} from "./layers/terrainRenderLayer";
import {RenderWorld} from "./data/renderWorld";

import {GLProgram} from "../common/glProgram";
import {GLTexture} from "../common/glTexture";
import {EntityRenderLayer} from "./layers/entityRenderLayer";

import SHADER_SRC_TILEMAP_VERT from "../mapShader.vsh?raw";
import SHADER_SRC_TILEMAP_FRAG from "../mapShader.fsh?raw";

import SHADER_SRC_ENTITY_VERT from "../entityShader.vsh?raw";
import SHADER_SRC_ENTITY_FRAG from "../entityShader.fsh?raw";
import {TextRenderer} from "../common/textRenderer";
import {MapModeRepository} from "../../../state/access/MapModeRepository";
import {TileRepository} from "../../../state/access/TileRepository";

export namespace RenderWorldFactory {

    export function createWorld(gl: WebGL2RenderingContext, mapModeRepository: MapModeRepository, tileRepository: TileRepository): RenderWorld {
        return new RenderWorld([
            createTerrainLayer(gl, mapModeRepository, tileRepository),
            createIconRenderLayer(gl),
        ]);
    }

    function createTerrainLayer(gl: WebGL2RenderingContext, mapModeRepository: MapModeRepository, tileRepository: TileRepository): TerrainRenderLayer {
        const program = GLProgram.create(gl, SHADER_SRC_TILEMAP_VERT, SHADER_SRC_TILEMAP_FRAG);
        const tileset = GLTexture.createFromPath(gl, "/tileset.png");
        return new TerrainRenderLayer(mapModeRepository, tileRepository, program, tileset);
    }

    function createIconRenderLayer(gl: WebGL2RenderingContext): EntityRenderLayer {
        const program = GLProgram.create(gl, SHADER_SRC_ENTITY_VERT, SHADER_SRC_ENTITY_FRAG);
        const texture = GLTexture.createFromPath(gl, "/resources.png");
        const textRenderer = new TextRenderer(gl);
        return new EntityRenderLayer(program, texture, textRenderer);
    }

}