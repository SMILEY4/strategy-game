// noinspection PointlessArithmeticExpressionJS

export namespace BufferPackager {

    // https://stackoverflow.com/questions/9583426/packing-data-in-webgl-float64-int64arrays-in-chrome
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays#multiple_views_on_the_same_data

    export interface Entry {
        type: "float" | "int" | "byte";
    }

    export function pack(data: number[], entries: Entry[]): ArrayBuffer {

        const amountPackages = data.length / entries.length;
        const bytesPerPackage = getPackageBytes(entries);
        const totalBytes = amountPackages * bytesPerPackage;

        const buffer = new ArrayBuffer(totalBytes);
        const bufferFloat32 = new Float32Array(buffer);
        const bufferInt32 = new Int32Array(buffer);
        const bufferInt8 = new Int8Array(buffer);

        let byteIndex = 0;
        data.forEach((value, valueIndex) => {
            const entry = entries[valueIndex % entries.length];
            switch (entry.type) {
                case "float": {
                    bufferFloat32[byteIndex / 4] = value;
                    byteIndex += 4;
                    break;
                }
                case "int": {
                    bufferInt32[byteIndex / 4] = value;
                    byteIndex += 4;
                    break;
                }
                case "byte": {
                    bufferInt8[byteIndex / 1] = value;
                    byteIndex += 1;
                    break;
                }
            }
        });

        return buffer;
    }

    function getPackageBytes(entries: Entry[]) {
        let bytes = 0;
        entries.forEach(entry => {
            switch (entry.type) {
                case "float": {
                    bytes += 4;
                    break;
                }
                case "int": {
                    bytes += 4;
                    break;
                }
                case "byte": {
                    bytes += 1;
                    break;
                }

            }
        });
        return bytes;
    }


}