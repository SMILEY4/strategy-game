import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

export type Txt_BodyProps = {}
    & ComponentPropsWithRef<"p">

export function Txt_Body(props: Txt_BodyProps): ReactElement {

    const {
        className,
        children,
        ...rest
    } = props;

    return (
        <p
            {...rest}
            className={classNames("txt", "txt--body", className)}
        >
            {children}
        </p>
    );
}
