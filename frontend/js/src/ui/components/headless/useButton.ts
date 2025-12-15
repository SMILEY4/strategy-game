import {UIAudio} from "../window/audio";
import {AudioId} from "../../../app/audio/gameAudio";

export interface UseButtonProps {
    disabled?: boolean,
    onClick?: () => void
    soundId?: AudioId
}

export function useButton(props: UseButtonProps) {

    const playSound = UIAudio.usePlayAudio(props.soundId ? props.soundId : "CLICK_PRIMARY");

    function handleClick() {
        if (!props.disabled && props.onClick) {
            playSound();
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