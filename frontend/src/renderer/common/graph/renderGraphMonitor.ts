export class RenderGraphMonitor {

	private entries: RenderGraphMonitorEntry[] = [];

	beginFrame(): void {
		this.entries = []
	}

	startCommand(name: string) {
		this.entries.push({
			name: name,
			start: Date.now(),
			end: -1
		})
	}

	endCommand() {
		if(this.entries.length > 0) {
			this.entries[this.entries.length - 1].end = Date.now()
		}
	}

	getEntries(): RenderGraphMonitorEntry[] {
		return this.entries;
	}

}

export interface RenderGraphMonitorEntry {
	name: string,
	start: number,
	end: number
}