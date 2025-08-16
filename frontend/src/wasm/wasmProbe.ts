export namespace WasmProbe {

	let last = 0;

	export function watchMemory(tag) {
		if(!window.__wasmMemory) {
			return;
		}

		const memory = window.__wasmMemory;

		const now = memory.buffer.byteLength;
		if (now !== last) {
			console.log(`[wasm] memory grew: ${(now / 65536) | 0} pages, ${now} bytes (from ${last}) at ${tag}`);
			last = now;
		}

	}

}