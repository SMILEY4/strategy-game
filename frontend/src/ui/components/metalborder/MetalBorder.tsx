import {ReactElement} from "react";
import "./metalBorder.css";
import {joinClassNames} from "../utils";

export interface MetalBorderProps {
    children?: any;
    className?: string
}

export function MetalBorder(props: MetalBorderProps): ReactElement {

    return (
        <div className={joinClassNames(["metal-border", props.className])}>
            <div className="metal-border__border-1"/>
            {props.children}
            <div className="metal-border__border-2"/>
        </div>
    );

}