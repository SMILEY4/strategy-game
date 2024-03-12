import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {VertexFullQuadNode} from "../../core/prebuilt/vertexFullquadNode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {NodeInput} from "../../core/graph/nodeInput";
import {GLUniformType} from "../../../shared/webgl/glTypes";
import {Camera} from "../../../shared/webgl/camera";
import {mat3} from "../../../shared/webgl/mat3";
import {MapMode} from "../../../models/mapMode";

export class DrawCombineLayersNode extends DrawRenderNode {

    private readonly camera: () => Camera;
    private readonly mapMode: () => MapMode;

    constructor(camera: () => Camera, mapMode: () => MapMode) {
        super({
            id: "drawnode.combinelayers",
            input: [
                new NodeInput.ClearColor({
                    clearColor: [0, 0, 0, 1],
                }),
                new NodeInput.Shader({
                    vertexId: "combine.vert",
                    fragmentId: "combine.frag",
                }),
                new NodeInput.VertexDescriptor({
                    id: VertexFullQuadNode.DATA_ID,
                }),
                //==== COMMON ========================================
                new NodeInput.Property({
                    binding: "u_common.invViewProjection",
                    type: GLUniformType.MAT3,
                    valueConstant: null,
                    valueProvider: () => mat3.inverse(this.camera().getViewProjectionMatrixOrThrow()),
                }),
                new NodeInput.Property({
                    binding: "u_common.timestamp",
                    type: GLUniformType.FLOAT,
                    valueConstant: null,
                    valueProvider: () => (Date.now() / 1000) % 10000
                }),
                new NodeInput.Property({
                    binding: "u_common.isGrayscale",
                    type: GLUniformType.INT,
                    valueConstant: null,
                    valueProvider: () => this.mapMode().renderData.grayscale ? 1 : 0
                }),
                new NodeInput.Texture({
                    binding: "u_common.noise",
                    path: "/textures/noise_watercolor.png",
                }),
                //==== WATER =========================================
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tileswater",
                    binding: "u_water.layer",
                }),
                new NodeInput.Property({
                    binding: "u_water.colorLight",
                    type: GLUniformType.VEC3,
                    valueConstant: [0.647, 0.753, 0.773],
                }),
                new NodeInput.Property({
                    binding: "u_water.colorDark",
                    type: GLUniformType.VEC3,
                    valueConstant: [0.475, 0.584, 0.682],
                }),
                new NodeInput.Property({
                    binding: "u_water.waveDistortionStrength",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.225,
                }),
                new NodeInput.Property({
                    binding: "u_water.waveDistortionScale",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.05,
                }),
                new NodeInput.Property({
                    binding: "u_water.waveSpeed",
                    type: GLUniformType.FLOAT,
                    valueConstant: 1.15,
                }),
                new NodeInput.Property({
                    binding: "u_water.waveSharpnesss",
                    type: GLUniformType.FLOAT,
                    valueConstant: 1.5,
                }),
                //==== LAND ==========================================
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tilesland",
                    binding: "u_land.layer",
                }),
                new NodeInput.Property({
                    binding: "u_land.cutoff",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.5,
                }),
                new NodeInput.Property({
                    binding: "u_land.outlineSizeLight",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.003,
                }),
                new NodeInput.Property({
                    binding: "u_land.outlineSizeDark",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.002,
                }),
                //==== FOG ===========================================
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tilesfog",
                    binding: "u_fog.layer",
                }),
                new NodeInput.Property({
                    binding: "u_fog.colorUnknown",
                    type: GLUniformType.VEC4,
                    valueConstant: [0.149, 0.122, 0.082, 1],
                }),
                new NodeInput.Property({
                    binding: "u_fog.colorDiscovered",
                    type: GLUniformType.VEC4,
                    valueConstant: [0.149, 0.122, 0.082, 0.6],
                }),
                //==== DETAILS =======================================
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.details",
                    binding: "u_details.layer",
                }),
                //==== ENTITIES ======================================
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.entities",
                    binding: "u_entities.layer",
                }),
                //==== ROUTES ========================================
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.routes",
                    binding: "u_routes.layer",
                }),
                //==== OVERLAY =======================================
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.overlay",
                    binding: "u_overlay.layer",
                }),
                //==== PAPER =========================================
                new NodeInput.Texture({
                    binding: "u_paper.large.texture",
                    path: "/textures/seamless_parchment_texture_by_fantasystock_dyu8dx-pre_grayscale_upscaled.jpg",
                }),
                new NodeInput.Property({
                    binding: "u_paper.large.scale",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.002,
                }),
                new NodeInput.Property({
                    binding: "u_paper.large.strength",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.25,
                }),
                new NodeInput.Property({
                    binding: "u_paper.large.contrast",
                    type: GLUniformType.FLOAT,
                    valueConstant: 2,
                }),
                new NodeInput.Texture({
                    binding: "u_paper.medium.texture",
                    path: "/textures/non_uniform_concret_wall_prepared.jpg",
                }),

                new NodeInput.Property({
                    binding: "u_paper.medium.scale",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.002,
                }),
                new NodeInput.Property({
                    binding: "u_paper.medium.strength",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.3,
                }),
                new NodeInput.Property({
                    binding: "u_paper.medium.contrast",
                    type: GLUniformType.FLOAT,
                    valueConstant: 1.0,
                }),
                new NodeInput.Texture({
                    binding: "u_paper.small.texture",
                    path: "/textures/wildtextures-just-paper-seamless-texture.jpg",
                }),

                new NodeInput.Property({
                    binding: "u_paper.small.scale",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.005,
                }),
                new NodeInput.Property({
                    binding: "u_paper.small.strength",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.2,
                }),
                new NodeInput.Property({
                    binding: "u_paper.small.contrast",
                    type: GLUniformType.FLOAT,
                    valueConstant: 2.0,
                }),
                new NodeInput.Texture({
                    binding: "u_paper.clouds.texture",
                    path: "/textures/noise_watercolor.png",
                }),

                new NodeInput.Property({
                    binding: "u_paper.clouds.scale",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.003,
                }),
                new NodeInput.Property({
                    binding: "u_paper.clouds.strength",
                    type: GLUniformType.FLOAT,
                    valueConstant: 0.2,
                }),
                new NodeInput.Property({
                    binding: "u_paper.clouds.contrast",
                    type: GLUniformType.FLOAT,
                    valueConstant: 1.0,
                }),
            ],
            output: [
                new NodeOutput.Screen(),
            ],
        });
        this.camera = camera;
        this.mapMode = mapMode;
    }
}