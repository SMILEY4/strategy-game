import {hash} from "./hash";

export namespace Random {

	/**
	 * Returns a random floating point value in range [0,1)
	 */
	export function normalized(seed?: string): number {
		if (seed != undefined) {
			return FastRandom.randomFloat(FastRandom.genSeed(seed));
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
		const index = Math.floor(normalized(seed) * array.length);
		return array[index];
	}

	/**
	 * Choose a random item from the given array. Returns null if the array is empty.
	 */
	export function chooseRandomOrNull<T>(array: T[], seed?: string): T | null {
		if (!array) {
			return null;
		}
		const index = Math.floor(normalized(seed) * array.length);
		return array[index];
	}

}

/**
 * Source: https://github.com/borilla/fast-random/blob/master/index.js
 */
export namespace FastRandom {

	export function randomInt(seed: number): number {
		return seed * 48271 % 2147483647;
	}

	export function randomFloat(seed: number): number {
		return (randomInt(seed) - 1) / 2147483646;
	}

	export function genSeed(s: any): number {
		let seed = hash(""+s)
		if(seed <= 0) {
			seed += 2147483646;
		}
		return seed;
	}

}