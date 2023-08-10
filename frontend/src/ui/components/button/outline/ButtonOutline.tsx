import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import "./buttonOutline.css";
import "../../variables.css";


export interface ButtonOutlineProps {
    disabled?: boolean;
    round?: boolean,
    onClick?: () => void;
    className?: string;
    classNameContent?: string;
    children?: any;
}

export function ButtonOutline(props: ButtonOutlineProps): ReactElement {
    return (
        <div
            className={joinClassNames([
                "button",
                "button-outline",
                props.disabled ? "button--disabled button-outline--disabled" : null,
                props.round ? "button-outline--round" : null,
                props.className,
            ])}
            onClick={handleClick}
        >
            {props.children}
        </div>
    );

    function handleClick() {
        if (!props.disabled && props.onClick) {
            props.onClick();
        }
    }

}