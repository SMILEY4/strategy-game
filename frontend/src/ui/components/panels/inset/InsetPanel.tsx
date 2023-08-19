import {joinClassNames} from "../../utils";
import "./insetPanel.scoped.less";

export interface InsetPanelProps {
    fillParent?: boolean,
    className?: string,
    children?: any;
}

export function InsetPanel(props: InsetPanelProps) {
    return (
        <div className={joinClassNames([
            "inset-panel",
            props.fillParent ? "inset-panel--fill-parent" : null,
            props.className,
        ])}>
            {props.children}
        </div>
    );
}