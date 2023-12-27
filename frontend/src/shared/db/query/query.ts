import {DatabaseStorage} from "../storage/databaseStorage";

export interface Query<STORAGE extends DatabaseStorage<ENTITY, ID>, ENTITY, ID, ARGS> {
    run(storage: STORAGE, args: ARGS): ENTITY[];
}