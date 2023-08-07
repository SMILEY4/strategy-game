export namespace Base64 {

    export function encodeOrNull(value: string | undefined | null): string | null {
        if (value) {
            return encode(value);
        } else {
            return null;
        }
    }

    export function encode(value: string): string {
        return btoa(value);
    }


    export function decodeOrNull(base64: string | undefined | null): string | null {
        if (base64) {
            return decode(base64);
        } else {
            return null;
        }
    }

    export function decode(base64: string): string {
        return atob(base64);
    }

}