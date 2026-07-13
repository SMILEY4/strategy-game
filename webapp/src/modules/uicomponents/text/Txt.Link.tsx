import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";
import {Link} from "react-router";

export type Txt_LinkProps = {
    to: string;
    children: string
} & Omit<ComponentPropsWithRef<"a">, "children" | "href">


export function Txt_Link(props: Txt_LinkProps): ReactElement {

    const {
        className,
        children,
        to,
        ...rest
    } = props;

    return (
        <Link
            {...rest}
            to={to}
            className={classNames("txt__link", className)}
        >
            {children}
        </Link>
    );
}
