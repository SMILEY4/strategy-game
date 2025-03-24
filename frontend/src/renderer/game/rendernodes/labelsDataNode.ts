import {GameHtmlRenderContext} from "../gameRenderContext";
import {HtmlDataEntry, HtmlDataNode} from "../../common/graph/nodes/htmlDataNode";
import {HtmlDataResource} from "../../common/graph/nodes/htmlDataNode";
import {TileSummary} from "../../../models/tile/tileSummary";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodes/nodeOutput";

export class LabelDataNode extends HtmlDataNode<GameHtmlRenderContext> {

	public static readonly ID = "htmldatanode.labels";

	constructor() {
		super({
			id: LabelDataNode.ID,
			changeKey: LabelDataNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlData({
					name: "htmldata.labels"
				})
			],
		});
	}

	execute(context: GameHtmlRenderContext): HtmlDataResource {

		const data: LabelHtmlData[] = []

		const settlements = context.settlements;
		for (let i = 0, n = settlements.length; i < n; i++) {
			const settlement = settlements[i];
			data.push({
				type: "location",
				tile: settlement.tile,
				name: settlement.name,
				color: `rgb(${settlement.country.color.red},${settlement.country.color.green},${settlement.country.color.blue})`,
				index: 0,
			});
		}

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.labels": data,
			}),
		});
	}

}

export interface LabelHtmlData extends HtmlDataEntry{
	tile: TileSummary,
	type: "location" | "location-pending" | "unit"
	name: string,
	color: string,
	index: number,
}