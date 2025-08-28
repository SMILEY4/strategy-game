export namespace WasmProbe {

	export function getMemory(): number {
		if(!window.__wasmMemory) {
			return 0;
		}
		const memory = window.__wasmMemory;
		return memory.buffer.byteLength;
	}

}