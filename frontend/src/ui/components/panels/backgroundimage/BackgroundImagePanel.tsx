import {joinClassNames} from "../../utils";
import "./backgroundImagePanel.scoped.less";


export interface BackgroundImagePanelProps {
    fillParent?: boolean,
    centerContent?: boolean,
    className?: string,
    children?: any;
}

export function BackgroundImagePanel(props: BackgroundImagePanelProps) {
    return (
        <div className={joinClassNames([
            "background-image-panel",
            props.fillParent ? "background-image-panel--fill" : undefined,
            props.centerContent ? "background-image-panel--center-content" : undefined,
            props.className,
        ])}>
            {props.children}
        </div>
    );
}