
const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

const buffer = pack(data, [
    {type: "float"},
    {type: "byte"}
])

console.log("data", data)
console.log("buffer", buffer)

function pack(data, entries) {
    const packageBytes = getPackageSize(entries);

    const buffer = new ArrayBuffer(4 * data.length)
    const bufferFloat32 = new Float32Array(buffer);
    const bufferInt32 = new Int32Array(buffer);
    const bufferInt8 = new Int8Array(buffer);

    let byteIndex = 0;
    data.forEach((value, valueIndex) => {
        const entry = entries[valueIndex % entries.length];
        console.log(valueIndex, byteIndex, entry.type, value)
        switch (entry.type) {
            case "float": {
                bufferFloat32[byteIndex / 4] = value
                byteIndex += 4;
                break;
            }
            case "int": {
                bufferInt32[byteIndex / 4] = value
                byteIndex += 4;
                break;
            }
            case "byte": {
                bufferInt8[byteIndex / 1] = value
                byteIndex += 1;
                break;
            }
        }
    });


    return [bufferFloat32, bufferInt32, bufferInt8];
}

function getPackageSize(entries) {
    let stride = 0;
    entries.forEach(entry => {
        switch (entry.type) {
            case "float":
                stride += 4;
                break;
            case "int":
                stride += 4;
                break;
            case "byte":
                stride += 1;
                break;
        }
    });
    return stride;
}