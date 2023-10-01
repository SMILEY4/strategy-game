import {TerrainRenderLayer} from "./terrainRenderLayer";
import {GLProgram, ShaderAttributeType, ShaderUniformType} from "../common/glProgram";
import {ProgramMetadata} from "../common/programMetadata";
import {RenderWorld} from "./renderWorld";

import SHADER_SRC_TILEMAP_VERT from "../../../logic/renderer/mapShader.vsh?raw";
import SHADER_SRC_TILEMAP_FRAG from "../../../logic/renderer/mapShader.fsh?raw";
import {GLTexture} from "../common/glTexture";

export namespace RenderWorldFactory {

    export function createWorld(gl: WebGL2RenderingContext): RenderWorld {
        return new RenderWorld([
            createTerrainLayer(gl),
        ]);
    }

    function createTerrainLayer(gl: WebGL2RenderingContext): TerrainRenderLayer {
        const program = GLProgram.create(gl, SHADER_SRC_TILEMAP_VERT, SHADER_SRC_TILEMAP_FRAG);
        const programMeta = ProgramMetadata.create(program, {
            uniforms: [
                {
                    name: "u_viewProjection",
                    type: ShaderUniformType.MAT3,
                },
                {
                    name: "u_texture",
                    type: ShaderUniformType.SAMPLER_2D,
                },
            ],
            attributes: ProgramMetadata.createAttributes([
                {
                    name: "in_worldPosition",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    name: "in_tilePosition",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 4,
                },
                {
                    name: "in_textureCoordinates",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    name: "in_terrain",
                    type: ShaderAttributeType.FLOAT,
                    amountComponents: 2,
                },
            ]),
        });
        const tileset = GLTexture.createFromPath(gl, "/tileset.png", "tileset.terrain")
        return new TerrainRenderLayer(program, programMeta, tileset);
    }

}