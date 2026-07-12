import type {ComponentPropsWithRef, ReactElement} from "react";
import "./text.less";

type Direction = "vertical" | "horizontal";

type DirectionShorthands = {
    vertical?: boolean;
    horizontal?: boolean;
}

type Variant = "invisible" | "line"

type VariantShorthands = {
    invisible?: boolean;
    line?: boolean;
}

type Size = "none" | "3xs" | "2xs" | "xs" | "s" // | ...

type SizeShorthands = {
    none?: boolean;
    size3xs?: boolean;
    size2xs?: boolean;
    sizeXs?: boolean;
    sizeS?: boolean;
    // ...
}

export type SeparatorProps = {

} & Omit<ComponentPropsWithRef<"div">, "children">

export function Separator(props: SeparatorProps): ReactElement {

    const {
        className,
        ...rest
    } = props;

    return (
        null as any // todo
    );
}
