import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./panelCloth.css";


export interface PanelClothProps {
    children?: any;
    className?: string;
    type?: "gray" | "red" | "blue";
}

export function PanelCloth(props: PanelClothProps): ReactElement {

    return (
        <div className={joinClassNames(["bg-panel", typeClass(props), props.className])}>
            <div className="bg-panel__overlay"/>
            {props.children}
        </div>
    );

    function typeClass(props: PanelClothProps): string {
        if (props.type === "red") return "bg-panel--red";
        if (props.type === "blue") return "bg-panel--blue";
        return "bg-panel--gray";
    }

}