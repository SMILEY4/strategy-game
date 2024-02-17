import {AbstractRenderNode} from "../../core/nodes/abstractRenderNode";
import {GLAttributeType} from "../../../shared/webgl/glTypes";

export class EntityVertexNode extends AbstractRenderNode {

    constructor() {
        super({
            id: "game.vertexnode.details",
            inputs: [],
            outputs: [
                {
                    type: "vertexdata",
                    name: "details",
                    attributes: [
                        {
                            binding: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            binding: "in_textureCoordinates",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            binding: "in_visibility",
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                        }
                    ]
                }
            ],
        });
    }

    execute(): void {
    }

}