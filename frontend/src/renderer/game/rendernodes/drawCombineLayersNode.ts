import {DrawRenderNode} from "../../core/graph/drawRenderNode";
import {VertexFullQuadNode} from "../../core/prebuiltnodes/vertexFullquadNode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {NodeInput} from "../../core/graph/nodeInput";
import {GLUniformType} from "../../../shared/webgl/glTypes";
import {Camera} from "../../../shared/webgl/camera";
import {mat3} from "../../../shared/webgl/mat3";

export class DrawCombineLayersNode extends DrawRenderNode {

    private readonly camera: () => Camera;

    constructor(camera: () => Camera) {
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
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tileswater",
                    binding: "u_water",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tilesland",
                    binding: "u_land",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.tilesfog",
                    binding: "u_fog",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.entities",
                    binding: "u_entities",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.details",
                    binding: "u_details",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.routes",
                    binding: "u_routes",
                }),
                new NodeInput.RenderTarget({
                    renderTargetId: "rendertarget.overlay",
                    binding: "u_overlay",
                }),
                new NodeInput.VertexDescriptor({
                    id: VertexFullQuadNode.DATA_ID,
                }),
                new NodeInput.Texture({
                    binding: "u_parchment",
                    path: "/textures/seamless_parchment_texture_by_fantasystock_dyu8dx-pre_grayscale_upscaled.jpg",
                }),
                new NodeInput.Texture({
                    binding: "u_paper",
                    path: "/textures/wildtextures-just-paper-seamless-texture.jpg",
                }),
                new NodeInput.Texture({
                    binding: "u_paperLarge",
                    path: "/textures/non_uniform_concret_wall_prepared.jpg",
                }),
                new NodeInput.Texture({
                    binding: "u_noise",
                    path: "/textures/noise_watercolor.png",
                }),
                new NodeInput.Property({
                    binding: "u_invViewProjection",
                    type: GLUniformType.MAT3,
                    valueConstant: null,
                    valueProvider: () => mat3.inverse(this.camera().getViewProjectionMatrixOrThrow()),
                }),
            ],
            output: [
                new NodeOutput.Screen(),
            ],
        });
        this.camera = camera;
    }
}