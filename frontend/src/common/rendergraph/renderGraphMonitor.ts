export namespace RenderGraphMonitor {

	const samples: ({ commandDebugData: any, duration: number, })[] = [];

	let pending: ({ commandDebugData: any, start: number, }) | null = null;


	export function startFrame() {
		samples.length = 0;
		pending = null;
	}

	export function endFrame() {
		let str = "";
		samples.forEach((sample, index) => {
			const command = sample.commandDebugData.command;
			const creator = sample.commandDebugData.creator ? ("-" + sample.commandDebugData.creator) : "";
			str += index + "-" + command + creator + "|" + sample.duration + "\n";
		});
		console.log(str);
	}

	export function startCommand(commandDebugData: any) {
		pending = {
			commandDebugData: commandDebugData,
			start: Date.now(),
		};
	}

	export function endCommand() {
		if (pending != null) {
			samples.push({
				commandDebugData: pending.commandDebugData,
				duration: Date.now() - pending.start,
			});
		}
	}

}