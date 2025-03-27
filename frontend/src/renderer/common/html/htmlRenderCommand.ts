import {RenderCommand} from "../graph/renderCommand";
import {HtmlResourceManager} from "./htmlResourceManager";
import {RenderGraphMonitor} from "../graph/renderGraphMonitor";
import {ChangeProvider} from "../graph/changeProvider";
import {HtmlDataEntry, HtmlNode} from "../graph/htmlNode";
import {HtmlOutputConfig} from "../graph/htmlOutputNode";
import {Camera} from "../../../common/webgl/camera";
import {Projections} from "../../../common/webgl/projections";
import {NodeOutput} from "../graph/nodeOutput";

export namespace HtmlRenderCommand {


	import Point = Projections.Point;

	export interface Context {
		monitor: RenderGraphMonitor,
		camera: Camera,
	}

	export interface Base extends RenderCommand<HtmlResourceManager, Context> {
		getDebugData(): any;
	}

	export class Update implements Base {
		private readonly node: HtmlNode<any>;
		private readonly changeProvider: ChangeProvider;

		constructor(node: HtmlNode<any>, changeProvider: ChangeProvider) {
			this.node = node;
			this.changeProvider = changeProvider;
		}

		execute(resourceManager: HtmlResourceManager, context: HtmlRenderCommand.Context): void {
			context.monitor.startCommand("Update-" + this.node.id);
			if (this.node.config.changeKey == null || this.changeProvider.hasChange(this.node.config.changeKey)) {
				const modified = this.node.execute(context);
				if (modified.outputs.size > 0) {
					for (let [outputId, outputData] of modified.outputs) {
						resourceManager.setData(outputId, outputData);
					}
				}
			}
			context.monitor.endCommand();
		}

		getDebugData(): any {
			return {
				command: "Update",
				node: this.node.id,
			};
		}

	}

	// noinspection SuspiciousTypeOfGuard
	export class Output implements Base {

		private readonly changeKeys: string[];
		private readonly changeProvider: ChangeProvider;
		private readonly containerId: string;
		private readonly inputDataConfigs: NodeOutput.HtmlData<any>[];

		constructor(nodeConfig: HtmlOutputConfig, inputDataConfigs: NodeOutput.HtmlData<any>[], additionalChangeKeys: string[], changeProvider: ChangeProvider) {
			this.changeKeys = [nodeConfig.changeKey, ...additionalChangeKeys].filter(it => it != null) as string[];
			this.changeProvider = changeProvider;
			this.containerId = nodeConfig.output.find(it => it instanceof NodeOutput.HtmlContainer)!.id;
			this.inputDataConfigs = inputDataConfigs;
		}

		execute(resourceManager: HtmlResourceManager, context: HtmlRenderCommand.Context): void {
			context.monitor.startCommand("Output-" + this.containerId);

			// check whether we need to do something
			if (!this.hasChange()) {
				context.monitor.endCommand();
				return;
			}

			const camera = context.camera;
			const renderedHtmlElements: HTMLElement[] = [];

			// for each input data group
			for (let i = 0; i < this.inputDataConfigs.length; i++) {
				const dataConfig = this.inputDataConfigs[i];
				const data = resourceManager.getData(dataConfig.name);
				if (data.length == 0) {
					continue;
				}

				// determine size of object on screen for culling
				const screenObjectRadius = dataConfig.boundsRadiusTiles != null
					? dataConfig.boundsRadiusTiles * this.getApproximateScreenTileSize(camera)
					: 0;

				// get pooled elements from last update, prepare for next update
				const prevPooledHtmlElements = resourceManager.getPooledHtmlElements(dataConfig.name);
				const nextPooledHtmlElements: HTMLElement[] = [];

				// determine whether this group uses low quality mode
				let useLowQuality = false;
				if (dataConfig.lowQualityThreshold != null) {
					if (dataConfig.boundsRadiusTiles == null) {
						useLowQuality = data.length > dataConfig.lowQualityThreshold;
					} else {
						useLowQuality = this.countVisible(data, camera, screenObjectRadius) > dataConfig.lowQualityThreshold;
					}
				}

				const templateElement = this.buildTemplateElement(dataConfig, resourceManager);
				const renderFunc = dataConfig.renderFunc;

				// for each (visible) element
				for (let j = 0, m = data.length; j < m; j++) {
					const dataEntry = data[j];
					if (dataConfig.boundsRadiusTiles != null && !this.isVisible(dataEntry, camera, screenObjectRadius)) {
						continue;
					}

					// get html element (from last time or create new from template)
					const htmlElement = j < prevPooledHtmlElements.length
						? prevPooledHtmlElements[j]
						: templateElement.cloneNode(true) as HTMLElement;

					// render / update html element
					renderFunc(context, dataEntry, htmlElement, useLowQuality);
					renderedHtmlElements.push(htmlElement);

					// add to elements pool for next time
					nextPooledHtmlElements.push(htmlElement);
				}

				// save pooled elements of group for next time
				resourceManager.setPooledHtmlElements(dataConfig.name, nextPooledHtmlElements);
			}

			// update elements in container
			const container = resourceManager.getContainer(this.containerId);
			container.replaceChildren(...renderedHtmlElements);

			context.monitor.endCommand();
		}

		private countVisible(data: HtmlDataEntry[], camera: Camera, screenObjectRadius: number): number {
			let count = 0;
			for (let i = 0, n = data.length; i < n; i++) {
				if (this.isVisible(data[i], camera, screenObjectRadius)) {
					count++;
				}
			}
			return count;
		}

		private buildTemplateElement(dataConfig: NodeOutput.HtmlData<any>, resourceManager: HtmlResourceManager): HTMLElement {
			const cachedTemplateElement = resourceManager.getTemplateElement(dataConfig.name);
			if (cachedTemplateElement) {
				return cachedTemplateElement;
			} else {
				const builtElement = dataConfig.templateFunc();
				resourceManager.setTemplateElement(dataConfig.name, builtElement);
				return builtElement;
			}
		}

		private hasChange(): boolean {
			for (let i = 0, n = this.changeKeys.length; i < n; i++) {
				const changeKey = this.changeKeys[i];
				if (changeKey == null || this.changeProvider.hasChange(changeKey)) {
					return true;
				}
			}
			return false;
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

		private isVisible(dataEntry: HtmlDataEntry, camera: Camera, clippingRadius: number): boolean {

			const pos = Projections.hexToScreen(camera, dataEntry.tile.position.q, dataEntry.tile.position.r);

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

		getDebugData(): any {
			return {
				command: "Output",
				container: this.containerId,
			};
		}
	}

}
