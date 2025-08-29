export namespace RenderGraphMonitor {

	const frames: ({ commands: ({ commandDebugData: any, duration: number })[]})[] = [];

	let pendingFrame:({ commands: ({ commandDebugData: any, duration: number, })[]}) | null = null
	let pendingCommand: ({ commandDebugData: any, start: number}) | null = null;


	export function startFrame() {
		pendingFrame = {
			commands: []
		};
		pendingCommand = null;
	}

	export function endFrame() {
		if(pendingFrame != null) {
			frames.push(pendingFrame)
			pendingFrame = null;
		}
	}

	export function startCommand(commandDebugData: any) {
		pendingCommand = {
			commandDebugData: commandDebugData,
			start: Date.now(),
		};
	}

	export function endCommand() {
		if (pendingCommand != null && pendingFrame != null) {
			pendingFrame?.commands.push({
				commandDebugData: pendingCommand.commandDebugData,
				duration: Date.now() - pendingCommand.start,
			});
		}
	}

	export function printLastFrame(minDuration: number) {
		if(frames.length == 0) {
			return;
		}

		const entries: ({ key: string, duration: number })[] = []

		frames[frames.length - 1].commands.forEach((sample, index) => {
			if(sample.duration >= minDuration) {
				const command = sample.commandDebugData.command;
				const creator = sample.commandDebugData.creator ? ("-" + sample.commandDebugData.creator) : "";
				const property = sample.commandDebugData.property ? ("-" + sample.commandDebugData.property) : "";
				entries.push({
					key: command + creator + property,
					duration: sample.duration,
				})
			}
		});

		entries.sort((a, b) => b.duration - a.duration);

		let str = "";
		for (let entry of entries) {
			str += "  - " + entry.key + ": " + entry.duration + "\n";
		}

		console.log("last frame data:\n", str);
	}

	export function printAverageTotal() {
		if(frames.length == 0) {
			return;
		}

		let sum = 0;
		frames.forEach(frame => {
			frame.commands.forEach(command => {
				sum += command.duration;
			})
		})

		console.log("average frame total", (sum / frames.length))
	}

}