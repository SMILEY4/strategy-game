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

    private readonly buffer: ArrayBuffer;
    private readonly bufferInt8: Int8Array;
    private readonly bufferInt16: Int16Array;
    private readonly bufferInt32: Int32Array;
    private readonly bufferUInt8: Uint8Array;
    private readonly bufferUInt16: Uint16Array;
    private readonly bufferUInt32: Uint32Array;
    private readonly bufferFloat32: Float32Array;
    private readonly pattern: MixedArrayBufferType[];
    private readonly patternBytes: number;

    constructor(lengthBytes: number, pattern: MixedArrayBufferType[]) {
        const maxBytes = MixedArrayBuffer.maxValueBytes(pattern);
        this.buffer = new ArrayBuffer(lengthBytes);
        this.bufferInt8 = maxBytes >= 1 ? new Int8Array(this.buffer) : null as any;
        this.bufferInt16 = maxBytes >= 2 ? new Int16Array(this.buffer) : null as any;
        this.bufferInt32 = maxBytes >= 4 ? new Int32Array(this.buffer) : null as any;
        this.bufferUInt8 = maxBytes >= 1 ? new Uint8Array(this.buffer) : null as any;
        this.bufferUInt16 = maxBytes >= 2 ? new Uint16Array(this.buffer) : null as any;
        this.bufferUInt32 = maxBytes >= 4 ? new Uint32Array(this.buffer) : null as any;
        this.bufferFloat32 = maxBytes >= 4 ? new Float32Array(this.buffer) : null as any;
        this.pattern = pattern;
        this.patternBytes = MixedArrayBuffer.getTotalRequiredBytes(1, pattern);
    }

    public getPattern(): MixedArrayBufferType[] {
        return this.pattern;
    }

    public getPatternBytes(): number {
        return this.patternBytes;
    }

    public getRawBuffer(): ArrayBuffer {
        return this.buffer;
    }

    public getBuffer(type: MixedArrayBufferType) {
        switch (type) {
            case MixedArrayBufferType.FLOAT:
                return this.bufferFloat32;
            case MixedArrayBufferType.BYTE:
                return this.bufferInt8;
            case MixedArrayBufferType.SHORT:
                return this.bufferInt16;
            case MixedArrayBufferType.INT:
                return this.bufferInt32;
            case MixedArrayBufferType.U_BYTE:
                return this.bufferUInt8;
            case MixedArrayBufferType.U_SHORT:
                return this.bufferUInt16;
            case MixedArrayBufferType.U_INT:
                return this.bufferUInt32;
            default:
                throw new Error("Could not get buffer for type. Invalid type:", type);
        }
    }

    public get(index: number, type: MixedArrayBufferType): number {
        return this.getBuffer(type)[index];
    }

    public set(index: number, type: MixedArrayBufferType, value: number) {
        this.getBuffer(type)[index] = value;
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

    private static maxValueBytes(pattern: MixedArrayBufferType[]): number {
        let maxBytes = 0;
        pattern.forEach(p => {
            const bytes = this.getBytes(p);
            if (bytes > maxBytes) {
                maxBytes = bytes;
            }
        });
        return maxBytes;
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
    private bytePosition: number = 0;


    constructor(buffer: MixedArrayBuffer) {
        this.buffer = buffer;
        this.pattern = buffer.getPattern();
    }

    public append(value: number | number[]) {
        if (Array.isArray(value)) {
            value.forEach(v => this.append(v));
        } else {
            const type = this.pattern[this.index % this.pattern.length];
            const amountBytes = MixedArrayBuffer.getBytes(type);
            const index = this.bytePosition / amountBytes;
            this.buffer.set(index, type, value);
            this.bytePosition += amountBytes;
            this.index += 1;
        }
    }

    public reset() {
        this.index = 0;
        this.bytePosition = 0;
    }

    public getWrappedBuffer(): MixedArrayBuffer {
        return this.buffer;
    }

    public getBytePosition(): number {
        return this.bytePosition;
    }

    public getIndex(): number {
        return this.index;
    }

}