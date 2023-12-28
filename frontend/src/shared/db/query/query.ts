import {PrimaryDatabaseStorage} from "../storage/primary/primaryDatabaseStorage";

/**
 * A database query taking some dynamic argument and returning some entities from the given storage
 */
export interface Query<STORAGE extends PrimaryDatabaseStorage<ENTITY, ID>, ENTITY, ID, ARGS> {
    /**
     * Provide some entities from the given storage based on the given argument
     * @param storage the store with the entities
     * @param args the dynamic argument
     * @return the resulting entities
     */
    run(storage: STORAGE, args: ARGS): ENTITY[] | ENTITY | null;
}