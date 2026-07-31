import {useEffect, useRef, useState} from "react";

export type TransitionState = "inactive" | "initial" | "active" | "dispose"

export function useTransitionState(value: boolean, duration: number): TransitionState {

    const [status, setStatus] = useState<TransitionState>("inactive");

    const prevValue = useRef(value);

    useEffect(() => {

        const prevValueUnpacked = prevValue.current;
        prevValue.current = value;

        // detect value change: false -> true
        if (!prevValueUnpacked && value) {
            queueMicrotask(() => {
                setStatus("initial");
                requestAnimationFrame(() => {
                    setStatus("active");
                });
            });
        }

        // detect value change: false -> true
        if (prevValueUnpacked && !value) {
            let timeout: unknown = 0;
            queueMicrotask(() => {
                setStatus("dispose");
                timeout = setTimeout(() => {
                    setStatus("inactive");
                }, duration);
            });
            return () => clearTimeout(timeout as number);
        }

        return undefined;
    }, [value, duration]);

    return status;
}