import {AbstractRenderNode} from "../../core/nodes/abstractRenderNode";


export class EntityRenderNode extends AbstractRenderNode {

    constructor() {
        super({
            id: "game.rendernode.entity",
            inputs: [
                {
                    type: "shader",
                    name: "shader.entity"
                },
                {
                    type: "vertexdata",
                    name: "vertex.entities"
                },
                {
                    type: "texture",
                    path: "path/to/entities.png",
                    binding: "u_tileset",
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
                }
            ],
        });
    }

    public execute() {
    }

}