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

	buildBaseElement(): HTMLElement {
		const html = `
			<div
				class='resource-icon'
				style='left:0;top:0;background-image:url("tbd")'
			>
			</div>
		`
		const element = document.createElement('div')
		element.innerHTML = html
		return element.children[0] as HTMLElement;
	}


	execute(context: GameHtmlRenderContext, data: ResourceIconsHtmlData, baseElement: HTMLElement) {
		const pos = Projections.hexToScreen(context.camera, data.tile.position.q, data.tile.position.r);
		pos.y = context.camera.getClientHeight() - pos.y;
		baseElement.style.left = pos.x.toString() + "px"
		baseElement.style.top = pos.y.toString() + "px"
		baseElement.style.backgroundImage = "url('" + data.type.getIconPath() + "')"
	}

}