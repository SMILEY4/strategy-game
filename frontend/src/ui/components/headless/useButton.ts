import {UIAudio} from "../audio";
import {AudioType} from "../../../logic/audio/audioService";

export interface UseButtonProps {
    disabled?: boolean,
    onClick?: () => void
    soundId?: string
}

export function useButton(props: UseButtonProps) {

    const playSound = UIAudio.usePlayAudio(props.soundId ? props.soundId : AudioType.CLICK_A.id);

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