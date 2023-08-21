import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./banner.scoped.less";

export interface BannerProps {
    spaceAbove?: boolean,
    className?: string,
    children?: any
}

export function Banner(props: BannerProps): ReactElement {
    return (
        <div className={joinClassNames([
            "banner",
            props.spaceAbove ? "banner--space-above" : null,
            props.className
        ])}>
            <div className="banner__shadow"/>
            <div className="banner__inner">
                {props.children}
            </div>
            <div className="banner__edge-shadow"/>
        </div>
    );
}