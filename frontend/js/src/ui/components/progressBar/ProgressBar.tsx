import React, {ReactElement} from "react";
import {formatPercentage, joinClassNames} from "../window/utils";
import "./progressBar.scoped.less";
import {BaseProps} from "../base/base";
import {Txt} from "../text/Txt";

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
            <Txt.Body className="progress-bar__value">
                <Txt.String>{formatPercentage(props.progress, false)}</Txt.String>
            </Txt.Body>
        </div>
    );
}