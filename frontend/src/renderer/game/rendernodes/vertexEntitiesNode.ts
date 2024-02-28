import {
    VertexBufferResource,
    VertexDataResource,
    VertexRenderNode,
} from "../../core/graph/vertexRenderNode";
import {GLAttributeType} from "../../../shared/webgl/glTypes";
import {buildMap} from "../../../shared/utils";

export class VertexEntitiesNode extends VertexRenderNode {

    constructor() {
        super({
            id: "vertexnode.entities",
            outputData: [
                {
                    id: "vertexdata.entities",
                    type: "basic",
                    attributes: [
                        {
                            origin: "vertexbuffer.entities",
                            name: "in_worldPosition",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            origin: "vertexbuffer.entities",
                            name: "in_textureCoordinates",
                            type: GLAttributeType.FLOAT,
                            amountComponents: 2,
                        },
                        {
                            origin: "vertexbuffer.entities",
                            name: "in_visibility",
                            type: GLAttributeType.INT,
                            amountComponents: 1,
                        },
                    ],
                },
            ]
        });
    }

    public execute(): VertexDataResource {
        // todo ...
        return new VertexDataResource({
            buffers: buildMap({
                "vertexbuffer.entities": new VertexBufferResource(new ArrayBuffer(0)),

            }),
            outputs: buildMap({
                "vertexnode.entities": {
                    vertexCount: 0,
                    instanceCount: 0,
                },
            }),
        });
    }
}