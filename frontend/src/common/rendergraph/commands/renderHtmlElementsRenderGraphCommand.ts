import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {RenderGraphCommand} from "../renderGraphCommand";
import {Camera} from "../../webgl/camera";
import {ElementCreatorRenderGraphNode} from "../nodes/elementCreatorRenderGraphNode";
import {Projections} from "../../webgl/projections";
import Point = Projections.Point;
import {ElementData} from "../resources/elementData";
import {PooledHtmlElementData} from "../resources/pooledHtmlElementData";
import {CachedHtmlElement} from "../resources/cachedHtmlElement";


export class RenderHtmlElementsRenderGraphCommand extends RenderGraphCommand {

	constructor(
		private readonly containerKey: string,
		private readonly cameraPropertyName: string,
		private readonly execCondition: () => boolean,
		private readonly sources: RenderHtmlElementsRenderGraphCommand.Source[],
	) {
		super();
	}

	execute(resourceManager: RenderGraphResourceManager, forceExecute: boolean): void {
		if (!this.execCondition() && !forceExecute) {
			return;
		}

		const camera = resourceManager.getResource<Camera>(this.cameraPropertyName);

		const renderedHtmlElements: HTMLElement[] = [];

		for (let i = 0, n = this.sources.length; i < n; i++) {
			const source = this.sources[i];
			const elementsData = resourceManager.getResource<ElementData>(source.elementDataKey);
			const elements = elementsData.elements;
			if (elements.length == 0) {
				continue;
			}

			// determine size of objects on screen for culling
			const screenObjectRadius = source.cullingRadius * this.getApproximateScreenTileSize(camera);

			// get pooled elements from last update, prepare for next update
			const pooledHtmlElementData = resourceManager.getResource<PooledHtmlElementData>(source.elementPoolKey);
			const nextPooledHtmlElements: HTMLElement[] = [];

			const templateElement = this.buildTemplateElement(source.templateFunc, pooledHtmlElementData);
			const renderFunc = source.renderFunc;

			// for each element
			for (let j = 0, m = elements.length; j < m; j++) {
				const element = elements[j];

				// check if visible on screen
				if (!this.isVisible(element, camera, screenObjectRadius)) {
					continue;
				}

				// prepare html element (from last time or create new from template)
				const htmlElement = j < pooledHtmlElementData.elements.length
					? pooledHtmlElementData.elements[j]
					: templateElement.cloneNode(true) as HTMLElement;

				// render / update html element
				renderFunc(element, htmlElement, camera);
				renderedHtmlElements.push(htmlElement);
				nextPooledHtmlElements.push(htmlElement);
			}

			// save pooled elements for next time
			pooledHtmlElementData.elements = nextPooledHtmlElements;
		}

		// update elements in container
		const cachedContainerData = resourceManager.getResource<CachedHtmlElement>(this.containerKey);
		const containerElement = this.getContainerElement(cachedContainerData);
		if (containerElement) {
			containerElement.replaceChildren(...renderedHtmlElements);
		}
	}

	private buildTemplateElement(templateFunc: () => HTMLElement, pooledHtmlElementData: PooledHtmlElementData): HTMLElement {
		const cachedTemplateElement = pooledHtmlElementData.templateElement;
		if (cachedTemplateElement) {
			return cachedTemplateElement;
		} else {
			const builtElement = templateFunc();
			pooledHtmlElementData.templateElement = builtElement;
			return builtElement;
		}
	}

	private getContainerElement(cachedContainerData: CachedHtmlElement): HTMLElement | null {
		if (cachedContainerData.element == null) {
			const element = document.getElementById(cachedContainerData.id);
			if (element) {
				cachedContainerData.element = element;
				return element;
			} else {
				return null;
			}
		} else {
			return cachedContainerData.element;
		}
	}

	private getApproximateScreenTileSize(camera: Camera): number {
		const p0 = Projections.hexToScreen(camera, 0, 0);
		const p1 = Projections.hexToScreen(camera, 0, 1);
		const p2 = Projections.hexToScreen(camera, 1, 0);
		return Math.max(this.distance(p0, p1), this.distance(p0, p2));
	}

	private distance(a: Point, b: Point): number {
		const dx = a.x - b.x;
		const dy = b.y - b.y;
		return Math.sqrt(dx * dx + dy * dy);
	}


	private isVisible(dataEntry: ElementCreatorRenderGraphNode.Element, camera: Camera, clippingRadius: number): boolean {
		if (clippingRadius > 99999) {
			return true;
		}

		const pos = Projections.hexToScreen(camera, dataEntry.position.q, dataEntry.position.r);

		// find the closest point visible on screen
		const closestX = Math.max(0, Math.min(pos.x, camera.getClientWidth()));
		const closestY = Math.max(0, Math.min(pos.y, camera.getClientHeight()));

		// find distance to the closest point
		const distanceX = pos.x - closestX;
		const distanceY = pos.y - closestY;
		const distanceSquared = distanceX * distanceX + distanceY * distanceY;

		// check if intersects screen
		return distanceSquared <= clippingRadius * clippingRadius;
	}

	getDebugData(): object {
		return {
			command: "RenderHtmlElements",
		};
	}
}


export namespace RenderHtmlElementsRenderGraphCommand {

	export interface Source {
		elementDataKey: string,
		elementPoolKey: string,
		cullingRadius: number,
		templateFunc: () => HTMLElement,
		renderFunc: (obj: any, target: HTMLElement, camera: Camera) => void,
	}

}