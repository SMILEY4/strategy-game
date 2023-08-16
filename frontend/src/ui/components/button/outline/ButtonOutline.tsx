import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import {useButton, UseButtonProps} from "../../headless/useButton";
import "./buttonOutline.scoped.css";


export interface ButtonOutlineProps extends UseButtonProps {
    round?: boolean,
    className?: string;
    classNameContent?: string;
    children?: any;
}

export function ButtonOutline(props: ButtonOutlineProps): ReactElement {

    const {elementProps, isDisabled} = useButton(props);

    return (
        <div
            {...elementProps}
            className={joinClassNames([
                "button",
                "button-outline",
                isDisabled ? "button--disabled button-outline--disabled" : null,
                props.round ? "button-outline--round" : null,
                props.className,
            ])}
        >
            {props.children}
        </div>
    );


}