import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

export type Txt_BodyProps = {
    light?: boolean,
} & ComponentPropsWithRef<"p">

export function Txt_Body(props: Txt_BodyProps): ReactElement {

    const {
        light = false,
        className,
        children,
        ...rest
    } = props;

    return (
        <p
            {...rest}
            className={classNames("txt", "txt--body", className)}
            data-light={light || undefined}
        >
            {children}
        </p>
    );
}
