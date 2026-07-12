import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

export type Txt_StringProps = {
    text: string,
} & ComponentPropsWithRef<"span">

export function Txt_String(props: Txt_StringProps): ReactElement {

    const {
        text,
        className,
        ...rest
    } = props;

    return (
        <span
            {...rest}
            className={classNames("txt__string", className)}
        >
            {text}
        </span>
    );
}
