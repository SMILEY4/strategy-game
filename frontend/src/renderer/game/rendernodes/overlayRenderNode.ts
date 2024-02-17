import {AbstractRenderNode} from "../../core/nodes/abstractRenderNode";

export class OverlayRenderNode extends AbstractRenderNode {

    constructor() {
        super({
            id: "game.rendernode.overlay",
            inputs: [
                {
                    type: "shader",
                    name: "shader.overlay"
                },
                {
                    type: "vertexdata",
                    name: "vertex.overlay"
                },
            ],
            outputs: [
                {
                    type: "render-target",
                    name: "game.rtgt.overlay",
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