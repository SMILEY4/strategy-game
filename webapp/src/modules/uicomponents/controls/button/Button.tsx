import {type ComponentPropsWithRef, type ReactElement, useCallback} from "react";
import classNames from "classnames";
import "./button.less";
import {useHover} from "@modules/uicomponents/hooks/useHover.ts";
import {usePress} from "@modules/uicomponents/hooks/usePress.ts";
import {gameAudio} from "@app/audio/gameAudio.ts";
import {assertExhaustive} from "@modules/utilities/assert-exhaustive.ts";

type Size =
    | "s"
    | "m"
    | "l";

type SizeShorthands = {
    sizeS?: boolean;
    sizeM?: boolean;
    sizeL?: boolean;
};

type Shape =
    | "box"
    | "square"
    | "pill"
    | "circle"

type ShapeShorthands = {
    box?: boolean,
    square?: boolean,
    pill?: boolean,
    circle?: boolean,
}

type Intent =
    | "neutral"
    | "danger"
    | "success"

type IntentShorthands = {
    neutral?: boolean;
    danger?: boolean;
    success?: boolean;
};

type Sound =
    | "silent"
    | "click"
    | "click-close"

type SoundShorthands = {
    silent?: boolean;
    playClick?: boolean;
    playClose?: boolean;
};

export type ButtonProps = {
        size?: Size,
        shape?: Shape,
        intent?: Intent,
        sound?: Sound,
        disabled?: boolean,
        formSubmit?: boolean,
        autoFocus?: boolean,
        onClick?: () => void,
    }
    & Omit<ComponentPropsWithRef<"button">, "onClick" | "disabled" | "autoFocus" | "type">
    & ShapeShorthands
    & SizeShorthands
    & IntentShorthands
    & SoundShorthands

export function Button(props: ButtonProps): ReactElement {

    const {
        disabled,
        formSubmit,
        autoFocus,
        onClick,
        className,
        children,

        // shape
        shape,
        box,
        square,
        pill,
        circle,

        // size
        size,
        sizeS,
        sizeM,
        sizeL,

        // intent
        intent,
        neutral,
        danger,
        success,

        // sound
        sound,
        silent,
        playClick,
        playClose,

        ...rest
    } = props;

    const shapeResolved = resolveShape({
        shape, circle, pill, square, box,
    });

    const sizeResolved = resolveSize({
        size, sizeS, sizeM, sizeL,
    });

    const intentResolved = resolveIntent({
        intent, neutral, danger, success,
    });

    const soundResolved = resolveSound({
        sound, silent, playClick, playClose,
    });

    const playSound = useCallback(() => {
        if (soundResolved === "silent") {
            return;
        }
        if (soundResolved === "click") {
            gameAudio.CLICK_PRIMARY.play();
            return;
        }
        if (soundResolved === "click-close") {
            gameAudio.CLICK_CLOSE.play();
            return;
        }
        assertExhaustive(soundResolved);
    }, [soundResolved]);

    const hover = useHover();

    const press = usePress({
        onClick: () => {
            playSound();
            onClick?.();
        },
        onPress: undefined,
        disabled: disabled,
        shouldTriggerOnKeyUp: true,
    });


    return (
        <button
            {...rest}

            {...hover.elementProps}
            {...hover.elementDataAttributes}

            {...press.elementProps}
            {...press.elementDataAttributes}

            className={classNames("button", className)}

            type={formSubmit ? "submit" : "button"}
            role={"button"}

            tabIndex={0}
            autoFocus={autoFocus}

            disabled={disabled}
            aria-disabled={disabled}

            data-shape={shapeResolved}
            data-size={sizeResolved}
            data-intent={intentResolved}
        >
            <div className={classNames("button__inner")}>
                {children}
            </div>
        </button>
    );
}

function resolveShape(props: { shape?: Shape } & ShapeShorthands): Shape | undefined {
    if (props.shape) return props.shape;
    if (props.circle) return "circle";
    if (props.pill) return "pill";
    if (props.square) return "square";
    if (props.box) return "box";
    return undefined;
}

function resolveSize(props: { size?: Size } & SizeShorthands): Size | undefined {
    if (props.size) return props.size;
    if (props.sizeS) return "s";
    if (props.sizeM) return "m";
    if (props.sizeL) return "l";
    return undefined;
}

function resolveIntent(props: { intent?: Intent } & IntentShorthands): Intent | undefined {
    if (props.intent) return props.intent;
    if (props.neutral) return "neutral";
    if (props.danger) return "danger";
    if (props.success) return "success";
    return undefined;
}

function resolveSound(props: { sound?: Sound } & SoundShorthands): Sound {
    if (props.sound) return props.sound;
    if (props.silent) return "silent";
    if (props.playClick) return "click";
    if (props.playClose) return "click-close";
    return "click";
}