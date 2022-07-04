import {MutableRefObject, useRef, useState} from "react";

export function useStateRef<S>(initialState: S): [S, MutableRefObject<S>, (value: S) => void] {

    const [value, setValue] = useState<S>(initialState);
    const ref = useRef<S>(initialState);

    function set(value: S) {
        ref.current = value;
        setValue(value);
    }

    return [value, ref, set];
}