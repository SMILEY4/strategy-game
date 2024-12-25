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
    round?: boolean,
    square?: boolean,
    small?: boolean,
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
            props.round ? "button--round" : null,
            props.square ? "button--square" : null,
            props.small ? "button--small" : null,
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