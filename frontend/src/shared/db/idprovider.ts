import {UID} from "../uid";

export type EntityIdProvider<ENTITY> = (entity: ENTITY) => string

export const UID_ENTITY_ID_PROVIDER: EntityIdProvider<any> = () => UID.generate();