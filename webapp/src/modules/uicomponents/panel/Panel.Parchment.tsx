import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import styles from "./panel.parchment.module.less";


type Edge =
    | "straight"
    | "simplified"
    | "detailed"

type EdgeShorthands = {
    straightEdge?: boolean;
    simplifiedEdge?: boolean;
    detailedEdge?: boolean;
};

type Border =
    | "none"
    | "ornamental"
    | "metal"

type BorderShorthands = {
    noBorder?: boolean;
    ornamentalBorder?: boolean;
    metalBorder?: boolean;
};


export type Panel_ParchmentProps = {
        edge?: Edge;
        border?: Border;
    }
    & ComponentPropsWithRef<"div">
    & EdgeShorthands
    & BorderShorthands

export function Panel_Parchment(props: Panel_ParchmentProps): ReactElement {

    const {
        className,
        children,

        // edge
        edge,
        straightEdge,
        simplifiedEdge,
        detailedEdge,

        // border
        border,
        noBorder,
        ornamentalBorder,
        metalBorder,

        // everything else
        ...rest
    } = props;

    const edgeResolved = resolveEdge({edge, straightEdge, simplifiedEdge, detailedEdge});

    const borderResolved = resolveBorder({border, noBorder, ornamentalBorder, metalBorder});

    return (
        <div
            {...rest}

            className={classNames(styles.panel, styles["panel--parchment"], className)}

            data-edge={edgeResolved}
            data-border={borderResolved}
        >
            <div className={styles["panel--parchment__inner"]}>
                {children}
            </div>
        </div>
    );
}

function resolveEdge(props: { edge?: Edge } & EdgeShorthands): Edge {
    if (props.edge) return props.edge;
    if (props.straightEdge) return "straight";
    if (props.simplifiedEdge) return "simplified";
    if (props.detailedEdge) return "detailed";
    return "detailed";
}

function resolveBorder(props: { border?: Border } & BorderShorthands): Border {
    if (props.border) return props.border;
    if (props.noBorder) return "none";
    if (props.ornamentalBorder) return "ornamental";
    if (props.metalBorder) return "metal";
    return "ornamental";
}