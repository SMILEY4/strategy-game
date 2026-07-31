import classNames from "classnames";
import {type ComponentPropsWithRef, type ReactElement} from "react";
import styles from "./textField.module.less";
import {useTextFieldInput} from "@modules/uicomponents/controls/textfield/useTextField.ts";


type TextField_InputProps = {
        value?: string,
        onValueChange?: (value: string) => void,
        onConfirm?: (value: string) => void,
    }
    & Omit<ComponentPropsWithRef<"input">, "onBlur" | "onKeyDown" | "onChange" | "type" | "value" | "children">


export function TextField_Input(props: TextField_InputProps): ReactElement {

    const {
        className,
        autoFocus,
        disabled,
        value,
        placeholder,
        onValueChange,
        onConfirm,

        // safe DOM props
        ...rest
    } = props;

    const elementProps = useTextFieldInput({value, onValueChange, onConfirm});

    return (
        <input
            {...rest}
            {...elementProps}
            className={classNames(styles["text-field__input"], className)}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            aria-placeholder={placeholder}
            aria-disabled={disabled}
        />
    );
}

TextField_Input.displayName = "TextField.Input";

