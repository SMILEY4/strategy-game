export class RenderGraphMonitor {

	private entries: RenderGraphMonitor.Entry[] = [];

	beginFrame(): void {
		if (!RenderGraphMonitor.enabled) {
			return;
		}
		this.entries = [];
	}

	startCommand(name: string) {
		if (!RenderGraphMonitor.enabled) {
			return;
		}
		this.entries.push({
			name: name,
			start: Date.now(),
			end: -1,
		});
	}

	endCommand() {
		if (!RenderGraphMonitor.enabled) {
			return;
		}
		if (this.entries.length > 0) {
			this.entries[this.entries.length - 1].end = Date.now();
		}
	}

	getEntries(): RenderGraphMonitor.Entry[] {
		return this.entries;
	}

}

export namespace RenderGraphMonitor {

	export let enabled: boolean = false;

	export interface Entry {
		name: string,
		start: number,
		end: number
	}

}
