import {AbstractRenderNode} from "../../core/nodes/abstractRenderNode";


export class CombineRenderNode extends AbstractRenderNode {

    constructor() {
        super({
            id: "game.rendernode.combine",
            inputs: [
                {
                    type: "shader",
                    vertex: "vertex.fullquad",
                    fragment: "fragment.combine"
                },
                {
                    type: "vertexdata",
                    name: "vertex.fullscreen"
                },
                {
                    type: "render-target",
                    name: "game.rtgt.water",
                    binding: "u_textureWater",
                },
                {
                    type: "render-target",
                    name: "game.rtgt.ground",
                    binding: "u_textureGround",
                },
                {
                    type: "render-target",
                    name: "game.rtgt.overlay",
                    binding: "u_textureOverlay",
                },
                {
                    type: "render-target",
                    name: "game.rtgt.entities",
                    binding: "u_textureEntities",
                },
                {
                    type: "render-target",
                    name: "game.rtgt.fog",
                    binding: "u_textureFog",
                },
                {
                    type: "texture",
                    path: "path/to/papertexture.png",
                    binding: "u_texturePaper",
                },
            ],
            outputs: [],
        });
    }

    public execute() {
    }

}