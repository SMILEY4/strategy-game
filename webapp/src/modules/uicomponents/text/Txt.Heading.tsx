import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

export type Txt_HeadingProps = {
    level?: 1 | 2 | 3 | 4 | 5 | 6,
} & ComponentPropsWithRef<"h1">

export function Txt_Heading(props: Txt_HeadingProps): ReactElement {

    const {
        level = 1,
        className,
        children,
        ...rest
    } = props;

    const Tag = `h${Math.min(Math.max(level, 1), 6)}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

    return (
        <Tag
            {...rest}
            className={classNames("txt", "txt--heading", className)}
            data-level={level}
        >
            {children}
        </Tag>
    );
}
