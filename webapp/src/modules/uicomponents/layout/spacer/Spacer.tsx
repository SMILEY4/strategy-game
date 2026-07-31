import classNames from "classnames";
import type {ComponentPropsWithRef, ReactElement} from "react";
import styles from "./spacer.module.less";

type SpacerProps = {
    direction?: "vertical" | "horizontal";
    vertical?: boolean,
    horizontal?: boolean,
} & Omit<ComponentPropsWithRef<"div">, "children">;


export function Spacer(props: SpacerProps): ReactElement {

    const {
        className,

        // direction
        direction,
        vertical,
        horizontal,

        // safe DOM props
        ...rest
    } = props;

    const directionResolved = resolveDirection({
        direction,
        vertical,
        horizontal,
    });

    return (
        <div
            {...rest}
            className={classNames(styles.spacer, className)}
            data-direction={directionResolved}
        />
    );
}

function resolveDirection(input: SpacerProps): "vertical" | "horizontal" | undefined {
    if (input.direction) return input.direction;
    if (input.vertical) return "vertical";
    if (input.horizontal) return "horizontal";
    return undefined;
}
