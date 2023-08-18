import {joinClassNames} from "../../utils";
import "./insetPanel.scoped.less";

export interface InsetPanelProps {
    className?: string,
    children?: any;
}

export function InsetPanel(props: InsetPanelProps) {
    return (
        <div className={joinClassNames([
            "inset-panel",
            props.className,
        ])}>
            {props.children}
        </div>
    );
}