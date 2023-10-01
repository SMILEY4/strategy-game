import {MixedArrayBuffer, MixedArrayBufferCursor, MixedArrayBufferType} from "./mixedArrayBuffer";

export namespace BufferPackager {

    export function pack(data: number[], pattern: MixedArrayBufferType[]): ArrayBuffer {
        const buffer = new MixedArrayBuffer(MixedArrayBuffer.getTotalRequiredBytes(data.length, pattern), pattern);
        const cursor = new MixedArrayBufferCursor(buffer);
        data.forEach(value => {
            cursor.append(value);
        });
        return buffer.getRawBuffer();
    }

}