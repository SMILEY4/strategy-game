import {ReactElement} from "react";
import "./list.css";
import {joinClassNames} from "../../utils";
import {BorderMetallic} from "../../objects/border/metallic/BorderMetallic";
import {ElementInset} from "../../objects/element/inset/ElementInset";


export interface ListProps {
    className?: string,
    border?: "gold" | "silver",
    children?: any
}

export function List(props: ListProps): ReactElement {
    return (
        <BorderMetallic
            color={props.border}
            className={joinClassNames(["list", props.className])}
        >
            <ElementInset className="list__content">
                {props.children}
            </ElementInset>
        </BorderMetallic>

    );
}