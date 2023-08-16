import React, {ReactElement} from "react";
import {joinClassNames} from "../../utils";
import {GiCheckMark} from "react-icons/gi";
import {useCheckbox, UseCheckboxProps} from "../../headless/useCheckbox";
import "./checkboxOutline.scoped.css";

export interface CheckboxOutlineProps extends UseCheckboxProps {
    round?: boolean,
    className?: string;
}

export function CheckboxOutline(props: CheckboxOutlineProps): ReactElement {

    const {elementProps, isSelected, isDisabled, isReadOnly} = useCheckbox(props);

    return (
        <div
            {...elementProps}
            className={joinClassNames([
                "checkbox",
                "checkbox-outline",
                isDisabled ? "checkbox--disabled checkbox-outline--disabled" : null,
                isReadOnly ? "checkbox--readonly checkbox-outline--readonly" : null,
                props.round ? "checkbox-outline--round" : null,
                props.className,
            ])}
        >
            {isSelected && (
                <GiCheckMark className="checkbox-outline__checkmark"/>
            )}
        </div>
    );

}