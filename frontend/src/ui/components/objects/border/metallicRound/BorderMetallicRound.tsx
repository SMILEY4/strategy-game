import {ReactElement} from "react";
import {joinClassNames} from "../../../utils";
import "./borderMetallicRound.css";

export interface BorderMetallicRoundProps {
    color?: "gold" | "silver";
    children?: any;
    className?: string;
    classNameContent?: string;
}

export function BorderMetallicRound(props: BorderMetallicRoundProps): ReactElement {

    return (
        <div className={joinClassNames(["border-metallic-round", colorClass(props), props.className])}>
            <div className="border-metallic-count__inner">
                <div className="border-metallic-count__content">
                    {props.children}
                </div>
            </div>
        </div>
    );

    function colorClass(props: BorderMetallicRoundProps): string {
        if (props.color === "silver") return "border-metallic-round--silver";
        return "border-metallic-round--gold";
    }

}