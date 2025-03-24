import {WebGLMonitor} from "../../../common/webgl/monitor/webGLMonitor";
import {RenderGraphMonitor} from "../../../renderer/common/graph/renderGraphMonitor";


export interface MonitoringService {
	/**
	 * Exports the current monitoring data
	 */
	exportData(): void;
}

export class MonitoringServiceImpl implements MonitoringService {

	private readonly webglMonitor: WebGLMonitor;
	private readonly renderGraphMonitor: RenderGraphMonitor;

	constructor(webglMonitor: WebGLMonitor, renderGraphMonitor: RenderGraphMonitor) {
		this.webglMonitor = webglMonitor;
		this.renderGraphMonitor = renderGraphMonitor;
	}

	exportData(): void {
		let file = "";

		file += "webgl resource info" + "\n";
		file += this.toCsv(this.createWebGlResourceInfo()) + "\n";
		file += "\n";

		file += "frame durations" + "\n";
		file += this.toCsv(this.createFrameDuration()) + "\n";
		file += "\n";

		file += "render graph commands" + "\n";
		file += this.toCsv(this.createRenderGraphCommandInfo()) + "\n";
		file += "\n";

		this.download("monitoring-" + Date.now() + ".txt", file);
	}

	private createWebGlResourceInfo(): string[][] {
		const data = this.webglMonitor.getData();
		const result: string[][] = [];
		result.push(["#buffers", "#framebuffers", "#programs", "#textures", "#vertexArrays"]);
		result.push([
			data.countBuffers.toString(),
			data.countFramebuffers.toString(),
			data.countPrograms.toString(),
			data.countTextures.toString(),
			data.countVertexArrays.toString(),
		]);
		return result;
	}

	private createFrameDuration(): string[][] {
		const data = this.webglMonitor.getData();
		const result: string[][] = [];

		result.push(["index", "duration_ms"]);
		data.frameDuration.getHistory().forEach((v, i) => {
			result.push([i.toString(), v.toString()]);
		});

		return result;
	}

	private createRenderGraphCommandInfo(): string[][] {
		const data = this.renderGraphMonitor.getEntries();
		const result: string[][] = [];

		result.push(["command", "duration_ms"]);
		data.forEach(entry => {
			result.push([entry.name, (entry.end-entry.start).toString()]);
		});

		return result;
	}

	private toCsv(data: string[][]): string {
		return data.map(row => row.join(";")).join("\n");
	}

	private download(filename: string, data: string): void {
		let element = document.createElement("a");
		element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
		element.setAttribute("download", filename);

		element.style.display = "none";
		document.body.appendChild(element);

		element.click();

		document.body.removeChild(element);
	}

}