import type {ComponentPropsWithRef, ReactElement} from "react";
import classNames from "classnames";
import styles from "./text.module.less";

export type Txt_ClickableProps = {
    onClick?: () => void,
} & ComponentPropsWithRef<"span">

export function Txt_Clickable(props: Txt_ClickableProps): ReactElement {

    const {
        onClick,
        className,
        children,
        ...rest
    } = props;

    return (
        <span
            {...rest}
            className={classNames(styles.txt__clickable, className)}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onClick();
                    }
                }
                : undefined
            }
        >
            {children}
        </span>
    );
}
