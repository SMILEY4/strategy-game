import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./insetElement.css";

export interface InsetElementProps {
    children?: any;
    className?: string
}

export function InsetElement(props: InsetElementProps): ReactElement {

    return (
        <div className={joinClassNames(["inset-element", props.className])}>
            {props.children}
        </div>
    );

}