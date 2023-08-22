import {ReactElement} from "react";
import {useButton, UseButtonProps} from "../../headless/useButton";
import {joinClassNames} from "../../utils";
import "./buttonPrimary.scoped.less";

export type ButtonPrimaryColor = "red" | "green" | "blue"

export interface ButtonPrimaryProps extends UseButtonProps {
    red?: boolean,
    green?: boolean,
    blue?: boolean,
    color?: ButtonPrimaryColor,
    round?: boolean,
    small?: boolean,
    className?: string;
    children?: any;
}

export function ButtonPrimary(props: ButtonPrimaryProps): ReactElement {

    const {elementProps, isDisabled} = useButton(props);

    return (
        <div {...elementProps} className={joinClassNames([
            "button-primary",
            "button--" + getColor(props),
            isDisabled ? "button--disabled" : null,
            props.round ? "button--round" : null,
            props.small ? "button--small" : null,
            props.className,
        ])}>
            <div className="button-primary__inner">
                {props.children}
            </div>
        </div>
    );

    function getColor(props: ButtonPrimaryProps): ButtonPrimaryColor {
        return props.color
            || (props.red ? "red" : undefined)
            || (props.green ? "green" : undefined)
            || (props.blue ? "blue" : undefined)
            || "red";
    }
}