import React, {ReactElement} from "react";
import {Text} from "../text_basic/Text";
import {formatPercentage, joinClassNames} from "../window/utils";
import "./progressBar.scoped.less";
import {BaseProps} from "../base/base";

export interface ProgressBarProps extends BaseProps {

    small?: boolean,

    border?: boolean,

    progress: number; // [0-1]
    onClick?: () => void,

    children?: any;
}

export function ProgressBar(props: ProgressBarProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "progress-bar",
                props.small ? "progress-bar--small" : null,
                props.border ? "progress-bar--border" : null,
                props.onClick ? "progress-bar--clickable" : null,
                ...BaseProps.buildBaseClassNames(props)
            ])}
            onClick={props.onClick}
            style={props.style}
        >
            <div className="progress-bar__bar" style={{right: (100 - props.progress * 100) + "%"}}/>
            {props.children || <div/>}
            <Text className={"progress-bar__value"}>{formatPercentage(props.progress, false)}</Text>
        </div>
    );
}