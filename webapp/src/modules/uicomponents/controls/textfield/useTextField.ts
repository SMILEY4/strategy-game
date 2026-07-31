import {useTextFieldContext} from "@modules/uicomponents/controls/textfield/TextField.Context.tsx";
import {type ChangeEvent, type KeyboardEvent, useRef, useState} from "react";

export function useTextFieldInput(props: {
    value: string | undefined,
    onValueChange?: (value: string) => void,
    onConfirm?: (value: string) => void,
}) {

    const {
        value,
        onValueChange,
        onConfirm
    } = props

    // text input state
    const typeInternal = useTextFieldContext().type;
    const [valueInternal, setValueInternal] = useState(value ?? "");

    // keeps track whether enter key was recently pressed
    const enterPressedRef = useRef(false);

    // handle update of input value
    function handleOnChange(event: ChangeEvent<HTMLInputElement>): void {
        onValueChange?.(event.target.value);
        if (props.value === undefined) {
            setValueInternal(event.target.value);
        }
    }

    // handle key down. un-focus and confirm with enter
    function handleKeyDown(event: KeyboardEvent<HTMLElement>): void {
        if (event.key === "Enter") {
            enterPressedRef.current = true;
            event.currentTarget.blur();
            onConfirm?.(value === undefined ? valueInternal : value);
        }
    }

    // handle un-focus and confirm (de-duplicate with enter key)
    function handleBlur() {
        if (enterPressedRef.current) {
            enterPressedRef.current = false;
        } else {
            onConfirm?.(value === undefined ? valueInternal : value);
        }
    }

    return {
        type: typeInternal,
        value: value === undefined ? valueInternal : value,
        onChange: handleOnChange,
        onKeyDown: handleKeyDown,
        onBlur: handleBlur,
    }
}