import classNames from "classnames";
import {type ComponentPropsWithoutRef, type ReactElement} from "react";
import styles from "./textField.module.less";


type Shape =
    | "box"
    | "pill"

type ShapeShorthands = {
    box?: boolean;
    pill?: boolean;
};

type Size =
    | "s"
    | "m"
    | "l";

type SizeShorthands = {
    sizeS?: boolean;
    sizeM?: boolean;
    sizeL?: boolean;
};

type TextField_ControlProps = {
        shape?: Shape;
        size?: Size;
    }
    & ComponentPropsWithoutRef<"div">
    & ShapeShorthands
    & SizeShorthands


export function TextField_Control(props: TextField_ControlProps): ReactElement {

    const {
        className,
        children,

        // shape
        shape,
        box,
        pill,

        // size
        size,
        sizeS,
        sizeM,
        sizeL,

        // safe DOM props
        ...rest
    } = props;

    const shapeResolved = resolveShape({
        shape,
        box,
        pill,
    });

    const sizeResolved = resolveSize({
        size,
        sizeS,
        sizeM,
        sizeL,
    });

    return (
        <div
            {...rest}
            className={classNames(styles["text-field__control"], className)}
            data-shape={shapeResolved}
            data-size={sizeResolved}
        >
            <div className={classNames(styles["text-field__control__inner"])}>
                {children}
            </div>
        </div>
    );
}

TextField_Control.displayName = "TextField.Control";

function resolveShape(props: { shape?: Shape } & ShapeShorthands): Shape | undefined {
    if (props.shape) return props.shape;
    if (props.box) return "box";
    if (props.pill) return "pill";
    return undefined;
}

function resolveSize(props: { size?: Size } & SizeShorthands): Size | undefined {
    if (props.size) return props.size;
    if (props.sizeS) return "s";
    if (props.sizeM) return "m";
    if (props.sizeL) return "l";
    return undefined;
}
