import {HtmlOutputNode} from "../../common/graph/nodes/htmlOutputNode";
import {NodeOutput} from "../../common/graph/nodes/nodeOutput";
import {NodeInput} from "../../common/graph/nodes/nodeInput";

export class GameHtmlOutputNode extends HtmlOutputNode {

	public static readonly ID = "html.draw";


	constructor() {
		super({
			id: GameHtmlOutputNode.ID,
			changeKey: GameHtmlOutputNode.ID,
			input: [
				new NodeInput.HtmlData({
					name: "htmldata.resourceicons",
				}),
			],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
			]
		});
	}

}