import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

export type Txt_StringProps = {
    children: string
} & Omit<ComponentPropsWithRef<"span">, "children">


export function Txt_String(props: Txt_StringProps): ReactElement {

    const {
        className,
        children,
        ...rest
    } = props;

    return (
        <span
            {...rest}
            className={classNames("txt__string", className)}
        >
            {children}
        </span>
    );
}
