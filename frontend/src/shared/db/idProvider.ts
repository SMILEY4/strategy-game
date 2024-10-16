export type IdProvider<ENTITY, ID> = (entity: ENTITY) => ID


export namespace IdProvider {

    export function toIds<ENTITY, ID>(idProvider: IdProvider<ENTITY, ID>, entities: ENTITY[]): ID[] {
        const ids: ID[] = []
        for (let i = 0, n=entities.length; i < n; i++) {
            ids.push(idProvider(entities[i]))
        }
        return ids
    }

    export function toId<ENTITY, ID>(idProvider: IdProvider<ENTITY, ID>, entity: ENTITY | null): ID | null {
        if(entity === null) {
            return null
        } else {
            return idProvider(entity)
        }
    }

}