import {bitSet} from "../../../shared/utils";

export function packBorder(data: boolean[]): number {
    let packed = 0;
    data.forEach((value, index) => {
        if (value) {
            packed = bitSet(packed, index);
        }
    });
    return packed;
}