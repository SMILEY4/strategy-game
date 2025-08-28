export enum MixedArrayBufferType {
	PADDING,
	FLOAT,
	BYTE,
	SHORT,
	INT,
	U_BYTE,
	U_SHORT,
	U_INT,
}

export namespace MixedArrayBufferType {

	export const VEC2: MixedArrayBufferType[] = [
		MixedArrayBufferType.FLOAT,
		MixedArrayBufferType.FLOAT,
	];

	export const VEC3: MixedArrayBufferType[] = [
		MixedArrayBufferType.FLOAT,
		MixedArrayBufferType.FLOAT,
		MixedArrayBufferType.FLOAT,
	];

	export const VEC4: MixedArrayBufferType[] = [
		MixedArrayBufferType.FLOAT,
		MixedArrayBufferType.FLOAT,
		MixedArrayBufferType.FLOAT,
		MixedArrayBufferType.FLOAT,
	];

	export const INT_VEC2: MixedArrayBufferType[] = [
		MixedArrayBufferType.INT,
		MixedArrayBufferType.INT,
	];

	export const INT_VEC3: MixedArrayBufferType[] = [
		MixedArrayBufferType.INT,
		MixedArrayBufferType.INT,
		MixedArrayBufferType.INT,
	];

	export const INT_VEC4: MixedArrayBufferType[] = [
		MixedArrayBufferType.INT,
		MixedArrayBufferType.INT,
		MixedArrayBufferType.INT,
		MixedArrayBufferType.INT,
	];

	export const PADDING_2: MixedArrayBufferType[] = [
		MixedArrayBufferType.PADDING,
		MixedArrayBufferType.PADDING,
	];

	export const PADDING_3: MixedArrayBufferType[] = [
		MixedArrayBufferType.PADDING,
		MixedArrayBufferType.PADDING,
		MixedArrayBufferType.PADDING,
	];
}


export class MixedArrayBuffer {

	private readonly bytes: Uint8Array;
	private readonly pattern: MixedArrayBufferType[];


	constructor(lengthBytes: number, pattern: MixedArrayBufferType[]) {
		this.bytes = new Uint8Array(lengthBytes);
		this.pattern = pattern;
	}

	public getPattern(): MixedArrayBufferType[] {
		return this.pattern;
	}

	public getBackingBuffer(): Uint8Array {
		return this.bytes;
	}

	public getRawBuffer(): ArrayBuffer {
		return this.getBackingBuffer();
	}

	public static getRequiredBytes(type: MixedArrayBufferType) {
		switch (type) {
			case MixedArrayBufferType.PADDING:
				return 1;
			case MixedArrayBufferType.BYTE:
				return 1;
			case MixedArrayBufferType.U_BYTE:
				return 1;
			case MixedArrayBufferType.U_SHORT:
				return 2;
			case MixedArrayBufferType.SHORT:
				return 2;
			case MixedArrayBufferType.U_INT:
				return 4;
			case MixedArrayBufferType.INT:
				return 4;
			case MixedArrayBufferType.FLOAT:
				return 4;
			default:
				throw new Error("Could not get amount of bytes for type. Invalid type.");
		}
	}

	public static getTotalRequiredBytes(amountRepetitions: number, pattern: MixedArrayBufferType[]): number {
		let bytesPerPattern = 0;
		pattern.forEach(type => {
			bytesPerPattern += MixedArrayBuffer.getRequiredBytes(type);
		});
		return amountRepetitions * bytesPerPattern;
	}
}


export class MixedArrayBufferCursor {

	private readonly pattern: MixedArrayBufferType[];
	private readonly view: DataView;

	private indexPattern: number = 0;
	private indexBytes: number = 0;


	constructor(buffer: MixedArrayBuffer) {
		this.view = new DataView(buffer.getBackingBuffer().buffer, 0, buffer.getBackingBuffer().byteLength);
		this.pattern = buffer.getPattern();
	}

	public push(value: number | number[]) {
		if (Array.isArray(value)) {
			this.pushValues(value);
		} else {
			this.pushValue(value);
		}
	}

	public pushValues(values: number[]) {
		for (let value of values) {
			this.pushValue(value);
		}
	}

	public pushValue(value: number) {
		const type = this.pattern[this.indexPattern % this.pattern.length];
		if(type == MixedArrayBufferType.PADDING) {
			this.indexBytes += 1;
			this.indexPattern += 1;
			this.pushValue(value);
			return;
		}

		// littleEndian largely untested!!
		switch (type) {
			case MixedArrayBufferType.U_BYTE:
				this.view.setUint8(this.indexBytes, value);
				this.indexBytes += 1;
				break;
			case MixedArrayBufferType.BYTE:
				this.view.setInt8(this.indexBytes, value);
				this.indexBytes += 1;
				break;
			case MixedArrayBufferType.U_SHORT:
				this.view.setUint16(this.indexBytes, value, false);
				this.indexBytes += 2;
				break;
			case MixedArrayBufferType.SHORT:
				this.view.setInt16(this.indexBytes, value, false);
				this.indexBytes += 2;
				break;
			case MixedArrayBufferType.U_INT:
				this.view.setUint32(this.indexBytes, value, false);
				this.indexBytes += 4;
				break;
			case MixedArrayBufferType.INT:
				this.view.setInt32(this.indexBytes, value, true);
				this.indexBytes += 4;
				break;
			case MixedArrayBufferType.FLOAT:
				this.view.setFloat32(this.indexBytes, value, true);
				this.indexBytes += 4;
				break;
			default:
				throw new Error("Could not set value. Invalid type.");
		}

		this.indexPattern += 1;
	}
}

export namespace MixedArrayBuffer {

	export function createWithCursor(amountRepetitions: number, pattern: MixedArrayBufferType[]): [MixedArrayBuffer, MixedArrayBufferCursor] {
		const array = new MixedArrayBuffer(MixedArrayBuffer.getTotalRequiredBytes(amountRepetitions, pattern), pattern);
		const cursor = new MixedArrayBufferCursor(array);
		return [array, cursor];
	}

}