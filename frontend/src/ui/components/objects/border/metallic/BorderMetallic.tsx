import {ReactElement} from "react";
import {joinClassNames} from "../../../utils";
import "./borderMetallic.css";

export interface BorderMetallicProps {
    color?: "gold" | "silver"
    children?: any;
    className?: string;
}

export function BorderMetallic(props: BorderMetallicProps): ReactElement {

    return (
        <div className={joinClassNames(["border-metallic", colorClass(props), props.className])}>
            <div className="border-metallic__border-1"/>
            <div className="border-metallic__content">
                {props.children}
            </div>
            <div className="border-metallic__border-2"/>
        </div>
    );

    function colorClass(props: BorderMetallicProps): string {
        if (props.color === "silver") return "border-metallic--silver";
        return "border-metallic--gold";
    }

}