export namespace UID {

    export function generate(): string {
        return crypto.randomUUID();
    }

}