import {DependencyList, useEffect, useState} from "react";

export function useBeforeRender(callback: () => void, deps?: DependencyList) {
    const [isRun, setIsRun] = useState(false);
    if (!isRun) {
        callback();
        setIsRun(true);
    }
    useEffect(() => () => setIsRun(false), deps);
}