import {HtmlDrawNode} from "../../common/graph/nodes/htmlDrawNode";
import {GameHtmlRenderContext} from "../gameRenderContext";
import {NodeOutput} from "../../common/graph/nodes/nodeOutput";
import {NodeInput} from "../../common/graph/nodes/nodeInput";
import {Projections} from "../../../common/webgl/projections";
import {ResourceIconsHtmlData} from "./resourceIconsDataNode";

export class ResourceIconsDrawNode extends HtmlDrawNode<GameHtmlRenderContext, ResourceIconsHtmlData> {

	public static readonly ID = "htmldrawnode.resourceicons";

	constructor() {
		super({
			id: ResourceIconsDrawNode.ID,
			changeKey: ResourceIconsDrawNode.ID,
			input: [
				new NodeInput.HtmlData({
					name: "htmldata.resourceicons",
				}),
			],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
			],
		});
	}

	execute(context: GameHtmlRenderContext, data: ResourceIconsHtmlData): Node {

		const pos = Projections.hexToScreen(context.camera, data.tile.position.q, data.tile.position.r);
		pos.y = context.camera.getClientHeight() - pos.y;

		const element = document.createElement("div");

		element.insertAdjacentHTML("afterbegin", `
			<div
				class='world-ui__icon'
				style='left:${pos.x.toString()}px;top:${pos.y.toString()}px;background-image:url("${data.type.getIconPath()}")'
			>
			</div>
		`);

		return element.children[0];
	}

}