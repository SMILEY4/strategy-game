import {AbstractRenderNode} from "../../core/nodes/abstractRenderNode";


export class FogRenderNode extends AbstractRenderNode {

    constructor() {
        super({
            id: "game.rendernode.fog",
            inputs: [
                {
                    type: "shader",
                    name: "shader.fog"
                },
                {
                    type: "vertexdata",
                    name: "vertex.fog"
                },
                {
                    type: "texture",
                    path: "path/to/splotch_texture.png",
                    binding: "u_tile",
                },
            ],
            outputs: [
                {
                    type: "render-target",
                    name: "game.rtgt.fog",
                    size: {
                        fractionHeight: 1,
                        fractionWidth: 1,
                    },
                },
            ],
        });
    }

    public execute() {
    }

}