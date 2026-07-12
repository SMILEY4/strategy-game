import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import "./text.less";

export type Txt_IconProps = {
    icon: ReactElement,
} & ComponentPropsWithRef<"span">

export function Txt_Icon(props: Txt_IconProps): ReactElement {

    const {
        icon,
        className,
        ...rest
    } = props;

    return (
        <span
            {...rest}
            className={classNames("txt__icon", className)}
        >
            {icon}
        </span>
    );
}
