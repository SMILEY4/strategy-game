import {ReactElement} from "react";
import "./list.css";
import {joinClassNames} from "../utils";
import {MetalBorder} from "../objects/metalborder/MetalBorder";
import {Depression} from "../objects/depression/Depression";


export interface ListProps {
    className?: string,
    borderType?: "gold" | "silver",
    children?: any
}

export function List(props: ListProps): ReactElement {
    return (
        <MetalBorder
            type={props.borderType || "gold"}
            className={joinClassNames(["list", props.className])}
        >
            <Depression className="list__content">
                {props.children}
            </Depression>
        </MetalBorder>

    );
}