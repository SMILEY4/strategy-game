import "./panel.less";
import {joinClassNames} from "../../components/utils";

export interface PanelProps {
    color: "blue" | "red" | "green" | "paper"
    children?: any;
}

export function Panel(props: PanelProps) {
    return (
        <div className={joinClassNames([
            "panel",
            "panel--" + props.color
        ])}>
            <div className="background"/>
            <div className="border"/>
            <div className="content">
                {props.children}
            </div>
        </div>
    );
}