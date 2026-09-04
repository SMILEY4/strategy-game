export interface VersionedContainer<TData> {
    revId: string
    data: TData,
}

export interface VersionedLazy<TData> {
    revId: string,
    load: () => VersionedContainer<TData>
}

export function createVersionedLazy<TData>(revId: string, load: () => TData): VersionedLazy<TData> {
    return {
        revId: revId,
        load: () => ({
            revId: revId,
            data: load(),
        }),
    };
}
