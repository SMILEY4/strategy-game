import {HtmlOutputNode} from "../../common/graph/htmlOutputNode";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {NodeInput} from "../../common/graph/nodeInput";

export class GameHtmlOutputNode extends HtmlOutputNode {

	public static readonly ID = "html.draw";


	constructor() {
		super({
			id: GameHtmlOutputNode.ID,
			changeKey: GameHtmlOutputNode.ID,
			input: [
				new NodeInput.HtmlData({
					name: "htmldata.labels",
				}),
				new NodeInput.HtmlData({
					name: "htmldata.paths",
				}),
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