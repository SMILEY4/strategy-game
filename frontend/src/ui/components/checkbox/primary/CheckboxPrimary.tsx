import React, {ReactElement} from "react";
import {MetalBorder} from "../../objects/metalborder/MetalBorder";
import {joinClassNames} from "../../utils";
import {GiCheckMark} from "react-icons/gi";
import "../../variables.css";
import "./checkboxPrimary.css";
import {useCheckbox, UseCheckboxProps} from "../../headless/useCheckbox";
import {Inset} from "../../objects/inset/Inset";

export interface CheckboxPrimaryProps extends UseCheckboxProps {
    borderType?: "gold" | "silver"
    round?: boolean,
    className?: string;
}

export function CheckboxPrimary(props: CheckboxPrimaryProps): ReactElement {

    const {elementProps, isSelected, isDisabled, isReadOnly} = useCheckbox(props);

    return (
        <MetalBorder
            className={joinClassNames([
                "checkbox",
                "checkbox-primary",
                isDisabled ? "checkbox--disabled checkbox-primary--disabled" : null,
                isReadOnly ? "checkbox--readonly checkbox-primary--readonly" : null,
                props.className,
            ])}
            type={props.borderType || "gold"}
            round={props.round}
        >
            <Inset
                {...elementProps}
                className="checkbox-primary__inner"
                interactiveHover={!isDisabled && !isReadOnly}
            >
                {isSelected && (
                    <GiCheckMark className="checkbox-primary__checkmark"/>
                )}
            </Inset>
        </MetalBorder>
    );

}