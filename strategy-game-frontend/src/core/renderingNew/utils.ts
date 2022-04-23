let sample: number = 0;


export function measure<T>(name: string, func: () => T): T {
	if (sample > 100) {
		return func();
	} else {
		sample++;
		const ts = performance.now();
		const result = func();
		const te = performance.now();
		console.log(name, "took", (te - ts) + "ms");
		return result;
	}
}