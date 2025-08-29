export interface UseCheckboxProps {
    selected?: boolean,
    disabled?: boolean,
    readOnly?: boolean,
    onChange?: (selected: boolean) => void
}

export function useCheckbox(props: UseCheckboxProps) {

    function handleClick() {
        if (props.onChange && !props.disabled && !props.readOnly) {
            props.onChange(!props.selected);
        }
    }

    return {
        elementProps: {
            onClick: handleClick
        },
        isDisabled: !!props.disabled,
        isReadOnly: !!props.readOnly,
        isSelected: !!props.selected
    }
}