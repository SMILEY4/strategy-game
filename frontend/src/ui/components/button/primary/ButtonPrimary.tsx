import {ReactElement} from "react";
import {useButton, UseButtonProps} from "../../headless/useButton";
import {joinClassNames} from "../../utils";
import "./buttonPrimary.scoped.less";

export type ButtonPrimaryType = "info" | "warn" | "success"

export interface ButtonPrimaryProps extends UseButtonProps {
    warn?: boolean,
    info?: boolean,
    success?: boolean,
    type?: ButtonPrimaryType,
    circle?: boolean,
    square?: boolean,
    round?: boolean,
    small?: boolean,
    active?: boolean,
    className?: string;
    children?: any;
}

export function ButtonPrimary(props: ButtonPrimaryProps): ReactElement {

    const {elementProps, isDisabled} = useButton(props);

    return (
        <div {...elementProps} className={joinClassNames([
            "button-primary",
            "button--" + getType(props),
            isDisabled ? "button--disabled" : null,
            props.circle ? "button--circle" : null,
            props.square ? "button--square" : null,
            props.round ? "button--round" : null,
            props.small ? "button--small" : null,
            props.active ? "button--active" : null,
            props.className,
        ])}>
            <div className="button-primary__inner">
                {props.children}
            </div>
        </div>
    );

    function getType(props: ButtonPrimaryProps): ButtonPrimaryType {
        return props.type
            || (props.info ? "info" : undefined)
            || (props.warn ? "warn" : undefined)
            || (props.success? "success" : undefined)
            || "info";
    }
}