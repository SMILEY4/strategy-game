import {ReactElement} from "react";
import {MetalBorder} from "../../objects/metalborder/MetalBorder";
import {Gem} from "../../objects/gem/Gem";
import {joinClassNames} from "../../utils";
import "./buttonPrimary.css";
import "../../variables.css";
import {useButton, UseButtonProps} from "../../headless/useButton";


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
        <MetalBorder
            className={joinClassNames([
                "button",
                "button-primary",
                props.disabled ? "button--disabled button-primary--disabled" : null,
                props.className
            ])}
            type={props.borderType || "gold"}
            round={props.round}
        >
            <Gem
                classNameContent={joinClassNames(["button-primary__content", props.classNameContent])}
                disabled={isDisabled}
                onClick={elementProps.onClick}
                round={props.round}
                interactive
            >
                {props.children}
            </Gem>
        </MetalBorder>
    );

}