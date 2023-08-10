import {ReactElement} from "react";
import {joinClassNames} from "../../../utils";
import "./panelCloth.css";


export interface PanelClothProps {
    children?: any;
    className?: string;
    color?: "gray" | "red" | "blue";
}

export function PanelCloth(props: PanelClothProps): ReactElement {

    return (
        <div className={joinClassNames(["panel-cloth", colorClass(props), props.className])}>
            <div className="panel-cloth__overlay"/>
            {props.children}
        </div>
    );

    function colorClass(props: PanelClothProps): string {
        if (props.color === "red") return "panel-cloth--red";
        if (props.color === "blue") return "panel-cloth--blue";
        return "panel-cloth--gray";
    }

}