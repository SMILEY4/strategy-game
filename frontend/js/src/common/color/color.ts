export type Color =
	Color.ColorRgbByte
	| Color.ColorRgbaByte
	| Color.ColorRgbFloat
	| Color.ColorRgbaFloat
	| Color.ColorHex;

export namespace Color {

	export interface AbstractColor {
		/**
		 * Get the red component in [0,255].
		 */
		getRedByte(): number;
		/**
		 * Get the red component in [0,1].
		 */
		getRedFloat(): number;
		/**
		 * Get the green component in [0,255].
		 */
		getGreenByte(): number;
		/**
		 * Get the green component in [0,1].
		 */
		getGreenFloat(): number;
		/**
		 * Get the blue component in [0,255].
		 */
		getBlueByte(): number;
		/**
		 * Get the blue component in [0,1].
		 */
		getBlueFloat(): number;
		/**
		 * Get the alpha component in [0,255].
		 */
		getAlphaByte(): number;
		/**
		 * Get the alpha component in [0,1].
		 */
		getAlphaFloat(): number;
		/**
		 * Convert to rgb color with values in [0, 255].
		 */
		toRgbByte(): ColorRgbByte;
		/**
		 * Convert to rgba color with values in [0, 255].
		 */
		toRgbaByte(): ColorRgbaByte;
		/**
		 * Convert to rgb color with values in [0, 1].
		 */
		toRgbFloat(): ColorRgbFloat;
		/**
		 * Convert to rgba color with values in [0, 1].
		 */
		toRgbaFloat(): ColorRgbaFloat;
		/**
		 * Convert to an array with the same values.
		 */
		toArray(): [number, number, number] | [number, number, number, number];
		/**
		 * Convert this color into a valid css color string.
		 */
		toCss(): string;
	}

	/**
	 * Color with rgb values in [0, 255]
	 */
	export class ColorRgbByte implements AbstractColor {
		public readonly red: number;
		public readonly green: number;
		public readonly blue: number;

		constructor(
			red: number,
			green: number,
			blue: number,
		) {
			this.blue = limit(blue, 0, 255);
			this.green = limit(green, 0, 255);
			this.red = limit(red, 0, 255);
		}

		getRedByte(): number {
			return this.red;
		}

		getRedFloat(): number {
			return this.red / 255;
		}

		getGreenByte(): number {
			return this.green;
		}

		getGreenFloat(): number {
			return this.green / 255;
		}

		getBlueByte(): number {
			return this.blue;
		}

		getBlueFloat(): number {
			return this.blue / 255;
		}

		getAlphaByte(): number {
			return 255;
		}

		getAlphaFloat(): number {
			return 1;
		}

		toRgbByte(): ColorRgbByte {
			return this;
		}

		toRgbaByte(): ColorRgbaByte {
			return new ColorRgbaByte(this.red, this.green, this.blue, 255);
		}

		toRgbFloat(): ColorRgbFloat {
			return new ColorRgbFloat(this.red / 255, this.green / 255, this.blue / 255);
		}

		toRgbaFloat(): ColorRgbaFloat {
			return new ColorRgbaFloat(this.red / 255, this.green / 255, this.blue / 255, 1);
		}

		toArray(): [number, number, number] {
			return [this.red, this.green, this.blue];
		}

		toCss(): string {
			return `rgb(${this.red},${this.green},${this.blue})`;
		}
	}

	/**
	 * Color with rgba values in [0, 255]
	 */
	export class ColorRgbaByte implements AbstractColor {
		public readonly red: number;
		public readonly green: number;
		public readonly blue: number;
		public readonly alpha: number;

		constructor(
			red: number,
			green: number,
			blue: number,
			alpha: number,
		) {
			this.blue = limit(blue, 0, 255);
			this.green = limit(green, 0, 255);
			this.red = limit(red, 0, 255);
			this.alpha = limit(alpha, 0, 255);
		}

		getRedByte(): number {
			return this.red;
		}

		getRedFloat(): number {
			return this.red / 255;
		}

		getGreenByte(): number {
			return this.green;
		}

		getGreenFloat(): number {
			return this.green / 255;
		}

		getBlueByte(): number {
			return this.blue;
		}

		getBlueFloat(): number {
			return this.blue / 255;
		}

		getAlphaByte(): number {
			return this.alpha;
		}

		getAlphaFloat(): number {
			return this.alpha / 255;
		}

		toRgbByte(): ColorRgbByte {
			return new ColorRgbByte(this.red, this.green, this.blue);
		}

		toRgbaByte(): ColorRgbaByte {
			return this;
		}

		toRgbFloat(): ColorRgbFloat {
			return new ColorRgbFloat(this.red / 255, this.green / 255, this.blue / 255);
		}

		toRgbaFloat(): ColorRgbaFloat {
			return new ColorRgbaFloat(this.red / 255, this.green / 255, this.blue / 255, this.alpha / 255);
		}

		toArray(): [number, number, number, number] {
			return [this.red, this.green, this.blue, this.alpha];
		}

		toCss(): string {
			return `rgba(${this.red},${this.green},${this.blue},${this.alpha})`;
		}
	}

	/**
	 * Color with rgb values in [0, 1]
	 */
	export class ColorRgbFloat implements AbstractColor {
		public readonly red: number;
		public readonly green: number;
		public readonly blue: number;

		constructor(
			red: number,
			green: number,
			blue: number,
		) {
			this.blue = limit(blue, 0, 1);
			this.green = limit(green, 0, 1);
			this.red = limit(red, 0, 1);
		}

		getRedByte(): number {
			return this.red * 255;
		}

		getRedFloat(): number {
			return this.red;
		}

		getGreenByte(): number {
			return this.green * 255;
		}

		getGreenFloat(): number {
			return this.green;
		}

		getBlueByte(): number {
			return this.blue * 255;
		}

		getBlueFloat(): number {
			return this.blue;
		}

		getAlphaByte(): number {
			return 255;
		}

		getAlphaFloat(): number {
			return 1;
		}

		toRgbByte(): ColorRgbByte {
			return new ColorRgbByte(this.red * 255, this.green * 255, this.blue * 255);
		}

		toRgbaByte(): ColorRgbaByte {
			return new ColorRgbaByte(this.red * 255, this.green * 255, this.blue * 255, 255);
		}

		toRgbFloat(): ColorRgbFloat {
			return this;
		}

		toRgbaFloat(): ColorRgbaFloat {
			return new ColorRgbaFloat(this.red, this.green, this.blue, 1);
		}

		toArray(): [number, number, number] {
			return [this.red, this.green, this.blue];
		}

		toCss(): string {
			return `rgb(${this.red},${this.green},${this.blue})`;
		}
	}

	/**
	 * Color with rgba values in [0, 1]
	 */
	export class ColorRgbaFloat implements AbstractColor {
		public readonly red: number;
		public readonly green: number;
		public readonly blue: number;
		public readonly alpha: number;

		constructor(
			red: number,
			green: number,
			blue: number,
			alpha: number,
		) {
			this.alpha = limit(alpha, 0, 1);
			this.blue = limit(blue, 0, 1);
			this.green = limit(green, 0, 1);
			this.red = limit(red, 0, 1);
		}

		getRedByte(): number {
			return this.red * 255;
		}

		getRedFloat(): number {
			return this.red;
		}

		getGreenByte(): number {
			return this.green * 255
		}

		getGreenFloat(): number {
			return this.green
		}

		getBlueByte(): number {
			return this.blue * 255
		}

		getBlueFloat(): number {
			return this.blue
		}

		getAlphaByte(): number {
			return this.alpha * 255
		}

		getAlphaFloat(): number {
			return this.alpha
		}

		toRgbByte(): ColorRgbByte {
			return new ColorRgbByte(this.red * 255, this.green * 255, this.blue * 255);
		}

		toRgbaByte(): ColorRgbaByte {
			return new ColorRgbaByte(this.red * 255, this.green * 255, this.blue * 255, this.alpha * 255);
		}

		toRgbFloat(): ColorRgbFloat {
			return new ColorRgbFloat(this.red, this.green, this.blue);
		}

		toRgbaFloat(): ColorRgbaFloat {
			return this;
		}

		toArray(): [number, number, number, number] {
			return [this.red, this.green, this.blue, this.alpha];
		}

		toCss(): string {
			return `rgba(${this.red},${this.green},${this.blue}, ,${this.alpha})`;
		}
	}

	/**
	 * Color with rgb hex color string
	 */
	export class ColorHex implements AbstractColor {
		public readonly value: string;
		private readonly backing: ColorRgbByte;

		constructor(value: string,) {
			this.value = value;

			const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.value);
			if (parsed == null) {
				throw new Error("Could not parse hex color string (" + this.value + ")");
			}
			this.backing = new ColorRgbByte(
				parseInt(parsed[1], 16),
				parseInt(parsed[2], 16),
				parseInt(parsed[3], 16),
			);
		}

		getRedByte(): number {
			return this.backing.getRedByte();
		}

		getRedFloat(): number {
			return this.backing.getRedFloat();
		}

		getGreenByte(): number {
			return this.backing.getGreenByte();
		}

		getGreenFloat(): number {
			return this.backing.getGreenFloat();
		}

		getBlueByte(): number {
			return this.backing.getBlueByte();
		}

		getBlueFloat(): number {
			return this.backing.getBlueFloat();
		}

		getAlphaByte(): number {
			return this.backing.getAlphaByte();
		}

		getAlphaFloat(): number {
			return this.backing.getAlphaFloat();
		}

		toRgbByte(): ColorRgbByte {
			return this.backing.toRgbByte();
		}

		toRgbaByte(): ColorRgbaByte {
			return this.backing.toRgbaByte();
		}

		toRgbFloat(): ColorRgbFloat {
			return this.backing.toRgbFloat();
		}

		toRgbaFloat(): ColorRgbaFloat {
			return this.backing.toRgbaFloat();
		}

		toArray(): [number, number, number] {
			return this.backing.toArray();
		}

		toCss(): string {
			return this.value;
		}
	}

	/**
	 * @param red color component in [0, 255]
	 * @param green color component in [0, 255]
	 * @param blue color component in [0, 255]
	 */
	export function rgbByte(red: number, green: number, blue: number): ColorRgbByte {
		return new ColorRgbByte(red, green, blue);
	}

	/**
	 * @param red color component in [0, 255]
	 * @param green color component in [0, 255]
	 * @param blue color component in [0, 255]
	 * @param alpha color component in [0, 255]
	 */
	export function rgbaByte(red: number, green: number, blue: number, alpha: number): ColorRgbaByte {
		return new ColorRgbaByte(red, green, blue, alpha);
	}

	/**
	 * @param red color component in [0, 1]
	 * @param green color component in [0, 1]
	 * @param blue color component in [0, 1]
	 */
	export function rgbFloat(red: number, green: number, blue: number): ColorRgbFloat {
		return new ColorRgbFloat(red, green, blue);
	}

	/**
	 * @param red color component in [0, 1]
	 * @param green color component in [0, 1]
	 * @param blue color component in [0, 1]
	 * @param alpha color component in [0, 1]
	 */
	export function rgbaFloat(red: number, green: number, blue: number, alpha: number): ColorRgbaFloat {
		return new ColorRgbaFloat(red, green, blue, alpha);
	}

	/**
	 * @param value color encoded as hex string
	 */
	export function hex(value: string): ColorHex {
		return new ColorHex(value);
	}

	export const BLACK = rgbByte(0, 0, 0);

	export const EMPTY = rgbaByte(0, 0, 0, 0);

	function limit(value: number, minInclusive: number, maxInclusive: number): number {
		return Math.max(minInclusive, Math.min(value, maxInclusive));
	}

}