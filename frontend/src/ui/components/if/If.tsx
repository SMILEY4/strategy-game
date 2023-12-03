import {ReactElement} from "react";

export interface IfProps {
    condition: boolean;
    children?: any;
}

export function If(props: IfProps): ReactElement | null {
    if (props.condition) {
        return props.children;
    } else {
        return null;
    }
}