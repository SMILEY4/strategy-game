import seedrandom from "seedrandom";

export namespace Random {

	/**
	 * Returns a random floating point value in range [0,1)
	 */
	export function normalized(seed?: string): number {
		if (seed != undefined) {
			return seedrandom(seed).quick();
		} else {
			return Math.random();
		}
	}

	/**
	 * Choose a random item from the given array. Throws error if the array is empty.
	 */
	export function chooseRandom<T>(array: T[], seed?: string): T {
		if (!array) {
			throw new Error("Cannot choose random item from empty array");
		}
		return array[Math.floor(normalized(seed) * array.length)];
	}

	/**
	 * Choose a random item from the given array. Returns null if the array is empty.
	 */
	export function chooseRandomOrNull<T>(array: T[], seed?: string): T | null {
		if (!array) {
			return null;
		}
		return array[Math.floor(normalized(seed) * array.length)];
	}

}