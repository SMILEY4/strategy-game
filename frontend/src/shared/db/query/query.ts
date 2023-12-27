import {DatabaseStorage} from "../storage/databaseStorage";

/**
 * A database query taking some dynamic argument and returning some entities from the given storage
 */
export interface Query<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID, ARGS> {
    /**
     * Provide some entities from the given storage based on the given argument
     * @param storage the store with the entities
     * @param args the dynamic argument
     * @return the resulting entities
     */
    run(storage: STORAGE, args: ARGS): ENTITY[];
}