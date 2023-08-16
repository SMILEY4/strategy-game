import {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import {useButton, UseButtonProps} from "../../headless/useButton";
import "./buttonPrimary.scoped.css";


export interface ButtonPrimaryProps extends UseButtonProps {
    borderType?: "gold" | "silver"
    round?: boolean,
    className?: string;
    classNameContent?: string;
    children?: any;
}

export function ButtonPrimary(props: ButtonPrimaryProps): ReactElement {

    const {elementProps, isDisabled} = useButton(props);

    return (
        <div
            {...elementProps}
            className={joinClassNames([
                "button",
                "button-primary",
                isDisabled ? "button--disabled button-primary--disabled" : null,
                props.round ? "button-primary--round" : null,
                props.className,
            ])}
        >
            {props.children}
        </div>
    );

}