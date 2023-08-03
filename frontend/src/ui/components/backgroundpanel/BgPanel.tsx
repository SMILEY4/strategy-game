import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./bgPanel.css";


export interface BgPanelProps {
    children?: any;
    className?: string;
    type?: "gray" | "red" | "blue";
}

export function BgPanel(props: BgPanelProps): ReactElement {

    return (
        <div className={joinClassNames(["bg-panel", typeClass(props), props.className])}>
            <div className="bg-panel__overlay"/>
            {props.children}
        </div>
    );

    function typeClass(props: BgPanelProps): string {
        if (props.type === "red") return "bg-panel--red";
        if (props.type === "blue") return "bg-panel--blue";
        return "bg-panel--gray";
    }

}