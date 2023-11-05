import React, {ReactElement} from "react";
import {Text} from "../text/Text";
import {formatPercentage, joinClassNames} from "../utils";
import "./progressBar.scoped.less";

export interface ProgressBarProps {
    progress: number; // [0-1]
    onClick?: () => void,
    className?: string
    children?: any;
}

export function ProgressBar(props: ProgressBarProps): ReactElement {
    return (
        <div
            className={joinClassNames(["progress-bar", props.className, props.onClick ? "progress-bar--clickable" : null])}
            onClick={props.onClick}
        >
            <div
                className="progress-bar__bar"
                style={{right: (100 - props.progress * 100) + "%"}}
            />
            {props.children || <div/>}
            <Text className={"progress-bar__value"}>{formatPercentage(props.progress, false)}</Text>
        </div>
    );
}