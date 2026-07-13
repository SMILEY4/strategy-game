import {type ComponentPropsWithRef, type ReactElement, useCallback, useState} from "react";
import classNames from "classnames";
import {Icon} from "@modules/uicomponents/icon/Icon";
import styles from "./checkbox.module.less";
import {gameAudio} from "@app/audio/gameAudio.ts";
import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";
import {useHover} from "@modules/uicomponents/hooks/useHover.ts";
import {usePress} from "@modules/uicomponents/hooks/usePress.ts";

type Size =
    | "s"
    | "m"
    | "l";

type SizeShorthands = {
    sizeS?: boolean;
    sizeM?: boolean;
    sizeL?: boolean;
}

type Sound =
    | "silent"
    | "click"

type SoundShorthands = {
    silent?: boolean;
    playClick?: boolean;
};

type CheckboxProps = {
        size?: Size;
        sound?: Sound;
        disabled?: boolean,
        autoFocus?: boolean,
        checked?: boolean,
        onChangeChecked?: (checked: boolean) => void,
        shouldTriggerOnKeyUp?: boolean;
    }
    & Omit<ComponentPropsWithRef<"button">, "onClick" | "disabled" | "autoFocus" | "type">
    & SizeShorthands
    & SoundShorthands

export function Checkbox(props: CheckboxProps): ReactElement {

    const {
        className,
        children,
        autoFocus,
        disabled,
        checked,
        onChangeChecked,
        shouldTriggerOnKeyUp,

        // size
        size,
        sizeS,
        sizeM,
        sizeL,

        // sound
        sound,
        silent,
        playClick,

        ...rest
    } = props;

    const sizeResolved = resolveSize({
        size, sizeS, sizeM, sizeL,
    });

    const soundResolved = resolveSound({
        sound, silent, playClick,
    });

    const playSound = useCallback(() => {
        if (soundResolved === "silent") {
            return;
        }
        if (soundResolved === "click") {
            gameAudio.CLICK_PRIMARY.play();
            return;
        }
        assertExhaustive(soundResolved);
    }, [soundResolved]);

    // the state whether the box is currently checked
    const [isCheckedInternal, setCheckedInternal] = useState(false)
    const isChecked = checked === undefined ? isCheckedInternal : checked

    // handles hover state
    const hover = useHover();

    // handles pressed/active state
    const press = usePress({
        disabled: disabled,
        onClick: () => {
            playSound();
            handleClick?.()
        },
        onPress: undefined,
        shouldTriggerOnKeyUp: shouldTriggerOnKeyUp,
    });

    // handle trigger
    function handleClick() {
        onChangeChecked?.(!isChecked)
        if(checked === undefined) {
            setCheckedInternal(!isChecked)
        }
    }

    return (
        <button
            {...rest}

            {...hover.elementProps}
            {...hover.elementDataAttributes}

            {...press.elementProps}
            {...press.elementDataAttributes}

            className={classNames(styles.checkbox, className)}

            type={"button"}
            role={"checkbox"}
            aria-checked={isChecked}

            tabIndex={0}
            autoFocus={autoFocus}

            disabled={disabled}
            aria-disabled={disabled}

            data-size={sizeResolved}
        >
            <div className={styles.checkbox__box}>
                <div className={styles.checkbox__box__inner}>
                    {isChecked && (<Icon.Check/>)}
                </div>
            </div>
            {children}
        </button>
    );
}

function resolveSize(props: { size?: Size } & SizeShorthands): Size | undefined {
    if (props.size) return props.size;
    if (props.sizeS) return "s";
    if (props.sizeM) return "m";
    if (props.sizeL) return "l";
    return undefined;
}

function resolveSound(props: { sound?: Sound } & SoundShorthands): Sound {
    if (props.sound) return props.sound;
    if (props.silent) return "silent";
    if (props.playClick) return "click";
    return "click";
}
