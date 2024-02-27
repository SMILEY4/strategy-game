import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../../core/graph/drawRenderNode";

export class DrawCombineLayersNode extends DrawRenderNode {

    constructor() {
        super({
            id: "drawnode.combinelayers",
            input: [],
            output: [
                new DrawRenderNodeOutput.Screen(),
            ],
        });
    }
}