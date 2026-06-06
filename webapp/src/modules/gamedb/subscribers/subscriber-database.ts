import type {DatabaseOperation} from "@/modules/gamedb/database/database-operation.ts";

/**
 * A subscriber listening to all changes in a database
 */
export interface DatabaseSubscriber<ENTITY> {
    callback: (entities: ENTITY[], operation: DatabaseOperation) => void;
}