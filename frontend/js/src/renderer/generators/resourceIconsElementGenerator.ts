import {RenderElement} from "../../common/rendergraph/nodes/renderElementGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {Projections} from "../../common/webgl/projections";
import {Camera} from "../../common/webgl/camera";
import {Tile} from "../../models/tile/tile";
import {MapMode} from "../../models/misc/mapMode";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";
import {ResourceType} from "../../models/misc/resourceType";

export namespace ResourceIconsElementGenerator {

	export const OUTPUT_ID = "resourceicons.elements";

	export function funcCreate(context: RenderGraphNodeContext): Map<string, RenderElement[]> {

		const relevantTiles = context.get<Tile[]>("relevantTiles");
		const mapMode = context.get<MapMode>("mapMode");

		const data: ResourceIconHtmlData[] = [];
		if (mapMode == MapMode.RESOURCES) {
			for (let i = 0, n = relevantTiles.length; i < n; i++) {
				const tile = relevantTiles[i];
				if (!tile.base.visible) {
					continue;
				}
				if (tile.base.value.resourceType !== ResourceType.NONE) {
					data.push({
						position: tile.position,
						type: tile.base.value.resourceType,
					});
				}
			}
		}

		return buildMap([
			[
				OUTPUT_ID,
				data,
			],
		]);
	}


	export function funcTemplate(): HTMLElement {
		const html = `	
			<div
				class='resource-icon'
				style='left:0;top:0;background-image:#ff00ff'
			>
			</div>
		`;
		const element = document.createElement("div");
		element.innerHTML = html;
		return element.children[0] as HTMLElement;
	}


	export function funcRender(obj: ResourceIconHtmlData, target: HTMLElement, lowQuality: boolean, camera: Camera) {
		const pos = Projections.hexToScreen(camera, obj.position.q, obj.position.r);
		pos.y = camera.getClientHeight() - pos.y;
		target.style.left = pos.x.toString() + "px";
		target.style.top = pos.y.toString() + "px";
		target.style.backgroundImage = "url('" + obj.type.getIconPath() + "')";
		target.className = lowQuality ? "resource-icon low-quality" : "resource-icon";

	}


	export interface ResourceIconHtmlData extends RenderElement {
		type: ResourceType;
	}

}