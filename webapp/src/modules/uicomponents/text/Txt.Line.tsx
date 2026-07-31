import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import styles from "./text.module.less";


type Align =
    | "left"
    | "center"
    | "right"

type AlignShorthands = {
    left?: boolean,
    center?: boolean,
    right?: boolean,
}

export type Txt_LineProps = {
        align?: Align,
        light?: boolean,
}
& ComponentPropsWithRef<"span">
    & AlignShorthands

export function Txt_Line(props: Txt_LineProps): ReactElement {

    const {
        light = false,
        className,
        children,

        // align
        align,
        left,
        center,
        right,

        ...rest
    } = props;

    const alignResolved = resolveAlign({align, left, center, right})

    return (
        <span
            {...rest}
            className={classNames(styles.txt, styles["txt--line"], className)}
            data-align={alignResolved}
            data-light={light || undefined}
        >
            {children}
        </span>
    );
}


function resolveAlign(props: { align?: Align } & AlignShorthands): Align | undefined {
    if (props.align) return props.align;
    if (props.left) return "left";
    if (props.center) return "center";
    if (props.right) return "right";
    return undefined;
}
