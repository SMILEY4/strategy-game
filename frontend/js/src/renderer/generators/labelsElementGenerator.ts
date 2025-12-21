import {
	RenderElement,
} from "../../common/rendergraph/nodes/renderElementGeneratorRenderGraphNode";
import {buildMap} from "../../common/utils";
import {Projections} from "../../common/webgl/projections";
import {TilemapUtils} from "../../common/tilemapUtils";
import {Camera} from "../../common/webgl/camera";
import {WorldObject, WorldObjectWithCommand} from "../../models/worldobject/worldObject";
import {RenderGraphNodeContext} from "../../common/rendergraph/renderGraphNodeContext";

export namespace LabelsElementGenerator {

	export const OUTPUT_ID = "labels.elements";

	export function funcCreate(context: RenderGraphNodeContext): Map<string, RenderElement[]> {

		const worldObjects = context.get<WorldObjectWithCommand[]>("worldObjects");

		const elementsByTile = new Map<string, LabelsHtmlData[]>();

		function addElement(element: LabelsHtmlData) {
			if (elementsByTile.has(element.tileId)) {
				elementsByTile.get(element.tileId)?.push(element);
			} else {
				elementsByTile.set(element.tileId, [element]);
			}
		}

		for (let i = 0, n = worldObjects.length; i < n; i++) {
			const worldObject = worldObjects[i];

			let nameAppendix = ""
			if(worldObject.commandState === "create") nameAppendix = " (+)"
			if(worldObject.commandState === "destroy") nameAppendix = " (-)"

			addElement({
				position: worldObject.tile.position,
				tileId: worldObject.tile.id,
				type: "unit",
				name: worldObject.type.group + "/" + worldObject.type.name + nameAppendix,
				color: worldObject.realm.color.toCss(),
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

		return buildMap([
			[
				OUTPUT_ID,
				allElements,
			],
		]);
	}


	export function funcTemplate(): HTMLElement {
		return document.createElement("div");
	}


	export function funcRender(obj: LabelsHtmlData, target: HTMLElement, lowQuality: boolean, camera: Camera) {

		const pos = Projections.hexToScreen(
			camera,
			obj.position.q, obj.position.r,
			[0, TilemapUtils.DEFAULT_HEX_LAYOUT.size[1] * 0.5]
		);
		pos.y = camera.getClientHeight() - pos.y;
		pos.y = pos.y + (obj.index * 20);

		target.style.left = pos.x + "px";
		target.style.top = pos.y + "px";
		target.className = "world-ui__label world-ui__label__" + obj.type;

		if (obj.name === "location-pending") {
			target.innerHTML = `
				<div class='world-ui__label__outer' style='border-color: ${obj.color}'>
					<div class='world-ui__label__inner' style='background-color: ${obj.color}'>
						${obj.name}
					</div>
				</div>
			`;
		} else {
			target.innerHTML = `
				<div class='world-ui__label__outer'>
					<div class='world-ui__label__inner' style='background-color: ${obj.color}'>
						${obj.name}
					</div>
				</div>
			`;
		}
	}


	export interface LabelsHtmlData extends RenderElement {
		tileId: string,
		type: "location" | "location-pending" | "unit"
		name: string,
		color: string,
		index: number,
	}

}