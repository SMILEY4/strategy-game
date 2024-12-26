import {joinClassNames} from "../../utils";
import "./indentPanel.scoped.less"

export interface IndentPanelProps {
    className?: string,
    children?: any;
}

export function IndentPanel(props: IndentPanelProps) {
    return (
        <div className={joinClassNames([
            "indent-panel",
            props.className,
        ])}>
            {props.children}
        </div>
    );
}