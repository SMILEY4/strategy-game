import type {BatchSupportingObject} from "@modules/gamedb/subscribers/batch-supporting-object.ts";

export function databaseBatch(batchObjects: BatchSupportingObject[], action: () => void) {
    try {
        batchObjects.forEach(it => it.startBatch());
        action();
    } finally {
        batchObjects.forEach(it => it.endBatch());
    }
}