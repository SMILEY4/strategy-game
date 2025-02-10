import {ReactElement} from "react";
import {useButton, UseButtonProps} from "../headless/useButton";
import {joinClassNames} from "../window/utils";
import "./button.scoped.less";
import {BaseProps} from "../base/base";


export interface ButtonProps extends UseButtonProps, BaseProps {

    type?: "info" | "warn" | "success",
    info?: boolean,
    warn?: boolean,
    success?: boolean,

    circle?: boolean,
    square?: boolean,
    rounded?: boolean,

    small?: boolean,

    children?: any;
}

export function Button(props: ButtonProps): ReactElement {
    const {elementProps, isDisabled} = useButton(props);
    const type = getType();
    const shape = getShape();
    return (
        <div
            {...elementProps}
            className={joinClassNames([
                "button",
                "button--" + type,
                shape ? "button--" + shape : null,
                isDisabled ? "button--disabled" : null,
                props.small ? "button--small" : null,
                ...BaseProps.buildBaseClassNames(props),
            ])}
            style={props.style}
        >
            <div className="button__inner">
                {props.children}
            </div>
        </div>
    );

    function getShape(): undefined | "circle" | "square" | "rounded" {
        if (props.circle) return "circle";
        if (props.square) return "square";
        if (props.rounded) return "rounded";
        return undefined;
    }

    function getType(): "info" | "warn" | "success" {
        if (props.type) return props.type;
        if (props.info) return "info";
        if (props.warn) return "warn";
        if (props.success) return "success";
        return "info";
    }
}