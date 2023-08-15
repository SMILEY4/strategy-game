import {ReactElement} from "react";
import "./list.css";
import {joinClassNames} from "../utils";
import {MetalBorder} from "../objects/metalborder/MetalBorder";
import {Inset} from "../objects/inset/Inset";


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
            <Inset className="list__content">
                {props.children}
            </Inset>
        </MetalBorder>

    );
}