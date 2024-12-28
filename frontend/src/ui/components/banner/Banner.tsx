import React, {ReactElement} from "react";
import {joinClassNames} from "../utils";
import "./banner.scoped.less";
import {Text} from "../text/Text";
import {Header2} from "../header/Header";
import {Color} from "../../../models/base/color";
import {HBox} from "../layout/hbox/HBox";

export interface BannerProps {
    color?: Color
    spaceAbove?: boolean,
    title?: string,
    subtitle?: string,
    className?: string,
    children?: any
}

export function Banner(props: BannerProps): ReactElement {
    let colorLight: Color | null = null;
    let colorDark: Color | null = null;
    if (props.color) {
        colorLight = {
            red: props.color.red * 0.7,
            green: props.color.green * 0.7,
            blue: props.color.blue * 0.7,
        };
        colorDark = {
            red: props.color.red * 0.25,
            green: props.color.green * 0.25,
            blue: props.color.blue * 0.25,
        };
    }
    return (
        <div className={joinClassNames([
            "banner",
            props.spaceAbove ? "banner--space-above" : null,
            props.className,
        ])}>
            <div className="banner__shadow"/>
            <div className="banner__inner" style={{
                background: props.color ? "radial-gradient(ellipse at bottom, " + Color.toCss(colorLight!) + " 0%, " + Color.toCss(colorDark!) + " 90%)" : undefined,
            }}>
                {props.title && (
                    <Header2 centered>{props.title}</Header2>
                )}
                {props.subtitle && (
                    <Text
                        align={"center"}
                        className={"banner__subtitle"}
                    >
                        {props.subtitle}
                    </Text>
                )}
                {props.children && (
                    <HBox right centerVertical gap_xs className="banner__children-container">
                        {props.children}
                    </HBox>
                )}
            </div>
            <div className="banner__edge-shadow"/>
        </div>
    );
}