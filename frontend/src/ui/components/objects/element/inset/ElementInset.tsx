import {ReactElement} from "react";
import {joinClassNames} from "../../../utils";
import "./elementInset.css";

export interface ElementInsetProps {
    children?: any;
    className?: string
}

export function ElementInset(props: ElementInsetProps): ReactElement {

    return (
        <div className={joinClassNames(["element-inset", props.className])}>
            {props.children}
        </div>
    );

}