import {ReactElement} from "react";
import {useTextField, UseTextFieldProps} from "../../headless/useTextField";
import {joinClassNames} from "../../utils";
import "./textFieldPrimary.scoped.css";

export interface TextFieldPrimaryProps extends UseTextFieldProps {
    borderType?: "gold" | "silver";
    className?: string;
}

export function TextFieldPrimary(props: TextFieldPrimaryProps): ReactElement {

    const {elementProps, isDisabled, isReadOnly} = useTextField(props);

    return (
        <input
            {...elementProps}
            className={joinClassNames([
                "text-field",
                "text-field-primary",
                isDisabled ? "text-field-primary--disabled text-field--disabled" : null,
                isReadOnly ? "text-field-primary--readonly text-field--readonly" : null,
                props.className,
            ])}
        />
    );
}