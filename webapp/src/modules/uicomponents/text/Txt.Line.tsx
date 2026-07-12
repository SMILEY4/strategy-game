import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

export type Txt_LineProps = {}
    & ComponentPropsWithRef<"span">

export function Txt_Line(props: Txt_LineProps): ReactElement {

    const {
        className,
        children,
        ...rest
    } = props;

    return (
        <span
            {...rest}
            className={classNames("txt", "txt--line", className)}
        >
            {children}
        </span>
    );
}
