import {ReactElement} from "react";
import {MetalBorder} from "../../objects/metalborder/MetalBorder";
import {Gem} from "../../objects/gem/Gem";
import {joinClassNames} from "../../utils";
import "./buttonPrimary.css";
import "../../variables.css";


export interface ButtonPrimaryProps {
    borderType?: "gold" | "silver"
    disabled?: boolean;
    round?: boolean,
    onClick?: () => void;
    className?: string;
    classNameContent?: string;
    children?: any;
}

export function ButtonPrimary(props: ButtonPrimaryProps): ReactElement {
    return (
        <MetalBorder
            className={joinClassNames([
                "button",
                "button-primary",
                props.disabled ? "button--disabled button-primary--disabled" : null,
            ])}
            type={props.borderType || "gold"}
            round={props.round}
        >
            <Gem
                classNameContent="button-primary__content"
                disabled={props.disabled}
                onClick={handleClick}
                round={props.round}
                interactive
            >
                {props.children}
            </Gem>
        </MetalBorder>
    );

    function handleClick() {
        if(!props.disabled && props.onClick) {
            props.onClick();
        }
    }

}