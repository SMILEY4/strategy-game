import {AppConfig} from "../../main";

export function useWebGlContext() {
    return [
        () => AppConfig.debugLooseWebglContext(),
        () => AppConfig.debugRestoreWebglContext(),
    ];
}
