import {joinClassNames} from "../../utils";
import "./decoratedPanel.less";

export interface DecoratedPanelProps {
    color: "blue" | "red" | "green" | "paper";
    children?: any;
}

export function DecoratedPanel(props: DecoratedPanelProps) {
    return (
        <div className={joinClassNames([
            "decorated-panel",
            "decorated-panel--" + props.color,
        ])}>
            <div className="background"/>
            <div className="border"/>
            <div className="content">
                {props.children}
            </div>
        </div>
    );
}