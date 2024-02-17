import {AbstractRenderNode} from "../../core/nodes/abstractRenderNode";
import {GLUniformType} from "../../../shared/webgl/glTypes";

export class GroundRenderNode extends AbstractRenderNode {

    constructor() {
        super({
            id: "game.rendernode.ground",
            inputs: [
                {
                    type: "shader",
                    name: "shader.ground"
                },
                {
                    type: "vertexdata",
                    name: "vertex.ground"
                },
                {
                    type: "texture",
                    path: "path/to/splotch_texture.png",
                    binding: "u_tile",
                },
                {
                    type: "property",
                    valueProvider: () => 1,
                    valueType: GLUniformType.INT,
                    binding: "u_mapMode"
                }
            ],
            outputs: [
                {
                    type: "render-target",
                    name: "game.rtgt.ground",
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