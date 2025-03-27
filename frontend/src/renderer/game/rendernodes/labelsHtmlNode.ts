import {GameHtmlRenderContext} from "../gameRenderContext";
import {HtmlDataEntry, HtmlDataResource, HtmlNode} from "../../common/graph/htmlNode";
import {TileSummary} from "../../../models/tile/tileSummary";
import {buildMap} from "../../../common/utils";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {CommandType} from "../../../models/command/commandType";
import {CreateSettlementCommand} from "../../../models/command/command";
import {Projections} from "../../../common/webgl/projections";
import {TilemapUtils} from "../../../common/tilemapUtils";

export class LabelsHtmlNode extends HtmlNode<GameHtmlRenderContext> {

	public static readonly ID = "html.labels";

	constructor() {
		super({
			id: LabelsHtmlNode.ID,
			changeKey: LabelsHtmlNode.ID,
			input: [],
			output: [
				new NodeOutput.HtmlData({
					name: "htmldata.labels",
					boundsRadiusTiles: 2,
					lowQualityThreshold: null,
					htmlFactory: LabelsHtmlNode.createHtmlElement,
					renderFunc: LabelsHtmlNode.render,
				}),
			],
		});
	}

	execute(context: GameHtmlRenderContext): HtmlDataResource {

		const elementsByTile = new Map<string, LabelsHtmlData[]>();

		function addElement(element: LabelsHtmlData) {
			if (elementsByTile.has(element.tile.id)) {
				elementsByTile.get(element.tile.id)?.push(element);
			} else {
				elementsByTile.set(element.tile.id, [element]);
			}
		}

		const createSettlementCommands = context.commands
			.filter(it => it.type === CommandType.CREATE_SETTLEMENT)
			.map(it => it as CreateSettlementCommand);

		const settlements = context.settlements;
		for (let i = 0, n = settlements.length; i < n; i++) {
			const settlement = settlements[i];
			addElement({
				type: "location",
				tile: settlement.tile,
				name: settlement.name,
				color: `rgb(${settlement.country.color.red},${settlement.country.color.green},${settlement.country.color.blue})`,
				index: 0,
			});
		}
		for (let i = 0, n = createSettlementCommands.length; i < n; i++) {
			const command = createSettlementCommands[i];
			addElement({
				type: "location-pending",
				tile: command.tile,
				name: command.name,
				color: `rgb(${context.playerCountry.color.red},${context.playerCountry.color.green},${context.playerCountry.color.blue})`,
				index: 0,
			});
		}

		const worldObjects = context.worldObjects;
		for (let i = 0, n = worldObjects.length; i < n; i++) {
			const worldObject = worldObjects[i];
			if (createSettlementCommands.some(cmd => cmd.worldObjectId === worldObject.id)) {
				continue;
			}
			addElement({
				type: "unit",
				tile: worldObject.tile,
				name: worldObject.type.id,
				color: `rgb(${worldObject.country.color.red},${worldObject.country.color.green},${worldObject.country.color.blue})`,
				index: 0,
			});
		}

		const allElements: LabelsHtmlData[] = [];
		elementsByTile.forEach((elements, _) => {
			elements.forEach((element, index) => {
				element.index = index;
				allElements.push(element);
			});
		});

		return new HtmlDataResource({
			outputs: buildMap({
				"htmldata.labels": allElements,
			}),
		});
	}

	static createHtmlElement(): HTMLElement {
		return document.createElement("div")
	}


	static render(context: GameHtmlRenderContext, data: LabelsHtmlData, baseElement: HTMLElement, _: boolean) {

		const pos = Projections.hexToScreen(
			context.camera,
			data.tile.position.q, data.tile.position.r,
			[0, TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 0.5]);
		pos.y = context.camera.getClientHeight() - pos.y;
		pos.y = pos.y + (data.index * 20);

		baseElement.style.left = pos.x + "px";
		baseElement.style.top = pos.y + "px";
		baseElement.className = "world-ui__label world-ui__label__" + data.type;

		if (data.name === "location-pending") {
			baseElement.innerHTML = `
				<div class='world-ui__label__outer' style='border-color: ${data.color}'>
					<div class='world-ui__label__inner' style='background-color: ${data.color}'>
						${data.name}
					</div>
				</div>
			`
		} else {
			baseElement.innerHTML = `
				<div class='world-ui__label__outer'>
					<div class='world-ui__label__inner' style='background-color: ${data.color}'>
						${data.name}
					</div>
				</div>
			`
		}
	}

}

export interface LabelsHtmlData extends HtmlDataEntry {
	type: "location" | "location-pending" | "unit"
	name: string,
	color: string,
	index: number,

}