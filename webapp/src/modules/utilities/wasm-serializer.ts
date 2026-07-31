import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";

export type RustType =
// Unsigned Integers
    | "u8"
    | "u16"
    | "u32"
    | "u64"
// Signed Integers
    | "i8"
    | "i16"
    | "i32"
    | "i64"
// Floating-Point Numbers
    | "f32"
    | "f64"
// Booleans & Characters
    | "bool"
    | "char"

export type WasmStructDescription<T> = Record<string, { provider: (item: T) => any, type: RustType }>

export const wasmSerializer = <T>(description: WasmStructDescription<T>) => {

    const properties = Object.values(description);
    const propertiesCount = properties.length;

    return ((buffer: Uint8Array, items: T[]) => {

        const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        let pointer = 0;

        for (let i = 0, n = items.length; i < n; i++) {
            const item = items[i];
            for (let j = 0; j < propertiesCount; j++) {
                const propertyDescription = properties[j];
                const propertyValue = propertyDescription.provider(item);

                switch (propertyDescription.type) {
                    case "u8": {
                        dataView.setUint8(pointer, propertyValue);
                        pointer += 1;
                        break;
                    }
                    case "u16": {
                        dataView.setUint16(pointer, propertyValue, true);
                        pointer += 2;
                        break;
                    }
                    case "u32": {
                        dataView.setUint32(pointer, propertyValue, true);
                        pointer += 4;
                        break;
                    }
                    case "u64": {
                        dataView.setBigUint64(pointer, BigInt(propertyValue), true);
                        pointer += 8;
                        break;
                    }
                    case "i8": {
                        dataView.setInt8(pointer, propertyValue);
                        pointer += 1;
                        break;
                    }
                    case "i16": {
                        dataView.setInt16(pointer, propertyValue, true);
                        pointer += 2;
                        break;
                    }
                    case "i32": {
                        dataView.setInt32(pointer, propertyValue, true);
                        pointer += 4;
                        break;
                    }
                    case "i64": {
                        dataView.setBigInt64(pointer, BigInt(propertyValue), true);
                        pointer += 8;
                        break;
                    }
                    case "f32": {
                        dataView.setFloat32(pointer, propertyValue, true);
                        pointer += 4;
                        break;
                    }
                    case "f64": {
                        dataView.setFloat64(pointer, propertyValue, true);
                        pointer += 8;
                        break;
                    }
                    case "bool": {
                        dataView.setUint8(pointer, propertyValue ? 1 : 0);
                        pointer += 1;
                        break;
                    }
                    case "char": {
                        const codePoint = typeof propertyValue === "string"
                            ? propertyValue.codePointAt(0) ?? 0
                            : propertyValue;
                        dataView.setUint32(pointer, codePoint, true);
                        pointer += 4;
                        break;
                    }
                    default: {
                        assertExhaustive(propertyDescription.type);
                    }
                }
            }
        }
    });
};