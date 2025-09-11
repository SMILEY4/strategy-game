export namespace WasmProbe {

	export function getMemory(): number {
		// @ts-ignore
		if(!window.__wasmMemory) { // note: window.__wasmMemory must have been manually set first.
			return 0;
		}
		// @ts-ignore
		const memory = window.__wasmMemory;
		return memory.buffer.byteLength;
	}

}