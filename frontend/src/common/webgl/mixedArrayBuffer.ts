export enum MixedArrayBufferType {
	FLOAT,
	BYTE,
	SHORT,
	INT,
	U_BYTE,
	U_SHORT,
	U_INT,
} // todo: => improved enum

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

}


export class MixedArrayBuffer {

	private readonly bytes: Uint8Array;
	private readonly view: DataView;
	private readonly writer: DataViewWriter;
	private readonly pattern: MixedArrayBufferType[];


	constructor(lengthBytes: number, pattern: MixedArrayBufferType[]) {
		this.bytes = new Uint8Array(lengthBytes);
		this.view = new DataView(this.bytes.buffer, 0, lengthBytes);
		this.writer = new DataViewWriter();
		this.writer.setDataView(this.view);
		this.pattern = pattern;
	}

	public getPattern(): MixedArrayBufferType[] {
		return this.pattern;
	}


	public getRawBuffer(): ArrayBuffer {
		return this.bytes;
	}

	public append(type: MixedArrayBufferType, value: number) {
		switch (type) {
			case MixedArrayBufferType.U_BYTE:
				this.writer.pushUint8(value)
				break;
			case MixedArrayBufferType.BYTE:
				this.writer.pushInt8(value)
				break;
			case MixedArrayBufferType.U_SHORT:
				this.writer.pushUint16(value)
				break;
			case MixedArrayBufferType.SHORT:
				this.writer.pushInt16(value)
				break;
			case MixedArrayBufferType.U_INT:
				this.writer.pushUint32(value)
				break;
			case MixedArrayBufferType.INT:
				this.writer.pushInt32(value)
				break;
			case MixedArrayBufferType.FLOAT:
				this.writer.pushFloat32(value)
				break;
			default:
				throw new Error("Could not push value. Invalid type:", type);
		}
	}

	public static getBytes(type: MixedArrayBufferType) {
		switch (type) {
			case MixedArrayBufferType.FLOAT:
				return 4;
			case MixedArrayBufferType.BYTE:
				return 1;
			case MixedArrayBufferType.SHORT:
				return 2;
			case MixedArrayBufferType.INT:
				return 4;
			case MixedArrayBufferType.U_BYTE:
				return 1;
			case MixedArrayBufferType.U_SHORT:
				return 2;
			case MixedArrayBufferType.U_INT:
				return 4;
			default:
				throw new Error("Could not get amount of bytes for type. Invalid type:", type);
		}
	}

	public static getTotalRequiredBytes(amountRepetitions: number, pattern: MixedArrayBufferType[]): number {
		let bytesPerPattern = 0;
		pattern.forEach(type => {
			bytesPerPattern += MixedArrayBuffer.getBytes(type);
		});
		return amountRepetitions * bytesPerPattern;
	}
}


export class MixedArrayBufferCursor {

	private readonly buffer: MixedArrayBuffer;
	private readonly pattern: MixedArrayBufferType[];
	private index: number = 0;


	constructor(buffer: MixedArrayBuffer) {
		this.buffer = buffer;
		this.pattern = buffer.getPattern();
	}

	public appendValues(values: number[]) {
		for (let value of values) {
			this.appendValue(value);
		}
	}

	public appendValue(value: number) {
		const type = this.pattern[this.index % this.pattern.length];
		this.buffer.append(type, value);
		this.index += 1;
	}


	public append(value: number | number[]) {
		if (Array.isArray(value)) {
			this.appendValues(value);
		} else {
			this.appendValue(value);
		}
	}

}

export namespace MixedArrayBuffer {

	export function createWithCursor(amountRepetitions: number, pattern: MixedArrayBufferType[]): [MixedArrayBuffer, MixedArrayBufferCursor] {
		const array = new MixedArrayBuffer(MixedArrayBuffer.getTotalRequiredBytes(amountRepetitions, pattern), pattern);
		const cursor = new MixedArrayBufferCursor(array);
		return [array, cursor];
	}

}

// todo: duplicate
class DataViewWriter {

	dataView: DataView = null!;
	counter = 0;

	setDataView(dataView: DataView) {
		this.dataView = dataView;
		this.counter = 0;
	}

	pushUint8(value: number) {
		this.dataView.setUint8(this.counter, value);
		this.counter += 1;
	}

	pushInt8(value: number) {
		this.dataView.setInt8(this.counter, value);
		this.counter += 1;
	}

	pushUint16(value: number) {
		this.dataView.setUint16(this.counter, value, false);
		this.counter += 2;
	}

	pushInt16(value: number) {
		this.dataView.setInt16(this.counter, value, false);
		this.counter += 2;
	}

	pushUint32(value: number) {
		this.dataView.setUint32(this.counter, value, false);
		this.counter += 4;
	}

	pushInt32(value: number) {
		this.dataView.setInt32(this.counter, value, true);
		this.counter += 4;
	}

	pushFloat32(value: number) {
		this.dataView.setFloat32(this.counter, value, true);
		this.counter += 4;
	}

}