import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./panelDecorated.css"

export interface PanelDecoratedProps {
    color?: "red" | "blue"
    className?: string;
    classNameContent?: string;
    children?: any;
}

export function PanelDecorated(props: PanelDecoratedProps): ReactElement {

    return (
        <div className={joinClassNames(["panel-decorated", colorClass(props), props.className])}>
            <div className="panel-decorated__background"/>
            <div className="panel-decorated__border"/>
            <div className={joinClassNames(["panel-decorated__content", props.classNameContent])}>
                {props.children}
            </div>
        </div>
    );

    function colorClass(props: PanelDecoratedProps): string {
        if (props.color === "blue") return "panel-decorated--blue";
        return "panel-decorated--red";
    }

}