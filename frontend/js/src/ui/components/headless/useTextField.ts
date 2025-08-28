import {useRef} from "react";

export interface UseTextFieldProps {
    value: string,
    placeholder?: string,
    type?: "text" | "password" | "email"
    disabled?: boolean,
    readOnly?: boolean,
    deselectBehaviour?: "nothing" | "commit" | "discard"
    onChange?: (value: string) => void,
    onCommit?: (value: string) => void,
    onDiscard?: (value: string) => void
}

export function useTextField(props: UseTextFieldProps) {

    const shouldIgnoreBlur = useRef(false);

    function commit(value: string) {
        if (props.onCommit && !props.disabled && !props.readOnly) {
            props.onCommit(value);
        }
    }

    function discard(value: string) {
        if (props.onDiscard && !props.disabled && !props.readOnly) {
            props.onDiscard(value);
        }
    }

    function handleChange(event: any) {
        const value = event.target.value
        if (props.onChange && !props.disabled && !props.readOnly) {
            props.onChange(value);
        }
    }

    function handleBlur() {
        const behaviour = props.deselectBehaviour || "commit";
        if (behaviour !== "nothing") {
            if (!shouldIgnoreBlur.current) {
                if (behaviour === "commit") {
                    commit(props.value);
                }
                if (behaviour === "discard") {
                    discard(props.value);
                }
            }
            shouldIgnoreBlur.current = false;
        }
    }

    function handleKeyDown(event: any) {
        if (event.code === "Enter") {
            shouldIgnoreBlur.current = true
            event.stopPropagation()
            commit(props.value)
            event.target.blur()
        } else if (event.code === "Escape") {
            shouldIgnoreBlur.current = true
            event.stopPropagation()
            discard((props.value))
            event.target.blur()
        }
    }

    return {
        elementProps: {
            type: props.type || "text",
            placeholder: props.placeholder,
            value: props.value,
            disabled: !!props.disabled || !!props.readOnly,
            onChange: handleChange,
            onBlur: handleBlur,
            onKeyDown: handleKeyDown,
        },
        isDisabled: !!props.disabled,
        isReadOnly: !!props.readOnly,
    };
}