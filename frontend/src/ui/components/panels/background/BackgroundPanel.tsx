import {joinClassNames} from "../../window/utils";
import {BaseProps} from "../../base/base";
import "./backgroundPanel.scoped.less";


export interface BackgroundPanelProps extends BaseProps {
    image?: string,
    children?: any;
}

/**
 * Background panel that fills the whole parent container
 * Displays a default gradient or given image.
 * Child elements are always centered.
 * Used for fullscreen backgrounds.
 */
export function BackgroundPanel(props: BackgroundPanelProps) {
    return (
        <div
            className={joinClassNames([
                "background-panel",
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={{
                backgroundImage: props.image && "url('" + props.image + "')",
                ...props.style,
            }}
        >
            <div className="background-panel__texture"/>
            <div className="background-panel__vignette"/>
            <div className="background-panel__content">
                {props.children}
            </div>
        </div>
    );
}