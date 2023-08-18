import {joinClassNames} from "../../utils";
import "./backgroundPanel.scoped.less";


export interface BackgroundPanelProps {
    fillParent?: boolean,
    centerContent?: boolean,
    className?: string,
    children?: any;
}

export function BackgroundPanel(props: BackgroundPanelProps) {
    return (
        <div className={joinClassNames([
            "background-panel",
            props.fillParent ? "background-panel--fill" : undefined,
            props.centerContent ? "background-panel--center-content" : undefined,
            props.className,
        ])}>
            <div className="background"/>
            <div className="content">
                {props.children}
            </div>
        </div>
    );
}