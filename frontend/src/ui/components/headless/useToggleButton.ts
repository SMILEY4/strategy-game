export interface UseToggleButtonProps {
    selected?: boolean,
    disabled?: boolean,
    readOnly?: boolean,
    onChange?: (selected: boolean) => void
}

export function useToggleButton(props: UseToggleButtonProps) {

    function handleClick() {
        if (props.onChange && !props.disabled && !props.readOnly) {
            props.onChange(!props.selected);
        }
    }

    return {
        elementProps: {
            onClick: handleClick,
        },
        isDisabled: !!props.disabled,
        isSelected: !!props.selected,
    };
}