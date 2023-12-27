export type DatabaseOperation = "insert" | "delete" | "modify"


export namespace DatabaseOperation {
    export const INSERT: DatabaseOperation = "insert"
    export const DELETE: DatabaseOperation = "delete"
    export const MODIFY: DatabaseOperation = "modify"

}