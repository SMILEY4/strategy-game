import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./text.scoped.less"

export interface TextProps {
    className?: string,
    children?: any;
}

export function Text(props: TextProps): ReactElement {
    return (
        <p
            className={joinClassNames([
                "text",
                props.className,
            ])}
        >
            {props.children}
        </p>
    );
}