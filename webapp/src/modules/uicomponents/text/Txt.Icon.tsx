import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

export type Txt_IconProps = {
    children: ReactElement,
} & Omit<ComponentPropsWithRef<"span">, "children">

export function Txt_Icon(props: Txt_IconProps): ReactElement {

    const {
        children,
        className,
        ...rest
    } = props;

    return (
        <span
            {...rest}
            className={classNames("txt__icon", className)}
        >
            {children}
        </span>
    );
}
