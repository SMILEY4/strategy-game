import {HtmlDrawNode} from "../../common/graph/nodes/htmlDrawNode";
import {GameHtmlRenderContext} from "../gameRenderContext";
import {NodeOutput} from "../../common/graph/nodes/nodeOutput";
import {NodeInput} from "../../common/graph/nodes/nodeInput";
import {LabelHtmlData} from "./labelsDataNode";
import {Projections} from "../../../common/webgl/projections";
import {TilemapUtils} from "../../../common/tilemapUtils";

export class LabelsDrawNode extends HtmlDrawNode<GameHtmlRenderContext, LabelHtmlData> {

	public static readonly ID = "htmldrawnode.labels";

	constructor() {
		super({
			id: LabelsDrawNode.ID,
			changeKey: LabelsDrawNode.ID,
			input: [
				new NodeInput.HtmlData({
					name: "htmldata.labels",
				}),
			],
			output: [
				new NodeOutput.HtmlContainer({
					id: "game-canvas-overlay",
				}),
			],
		});
	}

	execute(context: GameHtmlRenderContext, data: LabelHtmlData): Node {

		const pos = Projections.hexToScreen(
			context.camera,
			data.tile.position.q, data.tile.position.r,
			[0, TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 0.5]);

		pos.y = context.camera.getClientHeight() - pos.y;
		pos.y = pos.y + (data.index * 20);

		const element = document.createElement("div");

		if (data.name === "location-pending") {
			element.insertAdjacentHTML("afterbegin", `
				<div
					class='world-ui__label world-ui__label__location-pending'
					style='left:${pos.x.toString()}px;top:${pos.y.toString()}px;'
				>
					<div
						class='world-ui__label__outer'
						style='border-color: ${data.color}'
					>
						<div
							class='world-ui__label__inner'
							style='background-color: ${data.color}'
						>
							${data.name}
						</div>
					</div>
				</div>
			`);
		} else {
			element.insertAdjacentHTML("afterbegin", `
				<div
					class='world-ui__label world-ui__label__location'
					style='left:${pos.x.toString()}px;top:${pos.y.toString()}px;'
				>
					<div class='world-ui__label__outer'>
						<div class='world-ui__label__inner' style='background-color: ${data.color}'>
							${data.name}
						</div>
					</div>
				</div>
			`);
		}

		return element.children[0];
	}

}