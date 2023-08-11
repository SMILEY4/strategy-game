export interface UseButtonProps {
    disabled?: boolean,
    onClick?: () => void
}

export function useButton(props: UseButtonProps) {

    function handleClick() {
        if (!props.disabled && props.onClick) {
            props.onClick();
        }
    }

    return {
        elementProps: {
            onClick: handleClick,
        },
        isDisabled: !!props.disabled,
    };
}