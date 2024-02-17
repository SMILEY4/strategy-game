import {AbstractRenderNode} from "../../core/nodes/abstractRenderNode";

export class WaterRenderNode extends AbstractRenderNode {

    constructor() {
        super({
            id: "game.rendernode.water",
            inputs: [
                {
                    type: "shader",
                    name: "shader.water"
                },
                {
                    type: "vertexdata",
                    name: "vertex.water"
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
                    name: "game.rtgt.water",
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