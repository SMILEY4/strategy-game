export namespace UID {

    export function generate(): string {
        return Date.now() + "-" + Math.round(Math.random() * 1_000_000)
    }

}