import {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./banner.scoped.less";
import {Text} from "../text/Text";

export interface BannerProps {
    spaceAbove?: boolean,
    subtitle?: string,
    className?: string,
    children?: any
}

export function Banner(props: BannerProps): ReactElement {
    return (
        <div className={joinClassNames([
            "banner",
            props.spaceAbove ? "banner--space-above" : null,
            props.className,
        ])}>
            <div className="banner__shadow"/>
            <div className="banner__inner">
                {props.children}
                {props.subtitle && (
                    <Text
                        align={"center"}
                        className={"banner__subtitle"}
                    >
                        {props.subtitle}
                    </Text>
                )}
            </div>
            <div className="banner__edge-shadow"/>
        </div>
    );
}