import React, {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import {GiCheckMark} from "react-icons/gi";
import "./checkboxPrimary.scoped.css";
import {useCheckbox, UseCheckboxProps} from "../../headless/useCheckbox";

export interface CheckboxPrimaryProps extends UseCheckboxProps {
    borderType?: "gold" | "silver"
    round?: boolean,
    className?: string;
}

export function CheckboxPrimary(props: CheckboxPrimaryProps): ReactElement {

    const {elementProps, isSelected, isDisabled, isReadOnly} = useCheckbox(props);

    return (
        <div
            {...elementProps}
            className={joinClassNames([
                "checkbox",
                "checkbox-primary",
                isDisabled ? "checkbox--disabled checkbox-primary--disabled" : null,
                isReadOnly ? "checkbox--readonly checkbox-primary--readonly" : null,
                props.round ? "checkbox-primary--round" : null,
                props.className,
            ])}
        >
            {isSelected && (
                <GiCheckMark className="checkbox-primary__checkmark"/>
            )}
        </div>
    );

}