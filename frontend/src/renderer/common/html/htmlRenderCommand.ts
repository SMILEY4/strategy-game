import {RenderCommand} from "../graph/renderCommand";
import {HtmlResourceManager} from "./htmlResourceManager";
import {RenderGraphMonitor} from "../graph/renderGraphMonitor";
import {ChangeProvider} from "../graph/changeProvider";
import {HtmlDataEntry, HtmlDataNode} from "../graph/nodes/htmlDataNode";
import {HtmlDrawNode} from "../graph/nodes/htmlDrawNode";
import {Camera} from "../../../common/webgl/camera";
import {NodeInput} from "../graph/nodes/nodeInput";
import {Projections} from "../../../common/webgl/projections";

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
		private readonly node: HtmlDataNode<any>;
		private readonly changeProvider: ChangeProvider;

		constructor(node: HtmlDataNode<any>, changeProvider: ChangeProvider) {
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

	export class Draw implements Base {
		private readonly containerId: string;
		private readonly nodes: ({ node: HtmlDrawNode<any, any>, inputDataId: string })[];
		private readonly changeProvider: ChangeProvider;

		constructor(containerId: string, nodes: HtmlDrawNode<any, any>[], changeProvider: ChangeProvider) {
			this.containerId = containerId;
			this.nodes = nodes.map(node => ({
				node: node,
				inputDataId: (node.config.input.find(it => it instanceof NodeInput.HtmlData)! as NodeInput.HtmlData).name,
			}));
			this.changeProvider = changeProvider;
		}

		execute(resourceManager: HtmlResourceManager, context: HtmlRenderCommand.Context): void {
			context.monitor.startCommand("Draw-" + this.containerId);

			if (this.hasChange()) {

				const clippingRadius = 2 * this.getWorldScalingFactor(context.camera) // base value in tiles

				const htmlElements: Node[] = [];

				for (let i = 0; i < this.nodes.length; i++) {
					const nodeEntry = this.nodes[i];
					const node = nodeEntry.node;
					const data = resourceManager.getData(nodeEntry.inputDataId);
					for (let j = 0, m = data.length; j < m; j++) {
						const dataEntry = data[j];
						if (this.isVisible(dataEntry, context.camera, clippingRadius)) {
							htmlElements.push(node.execute(context, dataEntry));
						}
					}
				}

				const container = resourceManager.getContainer(this.containerId);
				container.replaceChildren(...htmlElements);
			}

			context.monitor.endCommand();
		}

		private hasChange(): boolean {
			for (let i = 0, n = this.nodes.length; i < n; i++) {
				const changeKey = this.nodes[i].node.config.changeKey;
				if (changeKey == null || this.changeProvider.hasChange(changeKey)) {
					return true;
				}
			}
			return false;
		}

		private getWorldScalingFactor(camera: Camera): number {
			const p0 = Projections.hexToScreen(camera, 0, 0);
			const p1 = Projections.hexToScreen(camera, 0, 1);
			const p2 = Projections.hexToScreen(camera, 1, 0);
			return Math.max(this.distance(p0, p1), this.distance(p0, p2))
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
				command: "Draw",
				container: this.containerId,
			};
		}
	}

}
