import React, {ReactElement} from "react";
import {joinClassNames} from "../window/utils";
import "./banner.scoped.less";
import {Text} from "../text/Text";
import {Header2} from "../header/Header";
import {Color} from "../../../models/base/color";
import {HBox} from "../layout/hbox/HBox";
import {BaseProps} from "../base/base";

export interface BannerProps extends BaseProps {
    color?: Color

    title?: string,
    subtitle?: string,

    spaceAbove?: boolean,

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

            <div className="banner__inner" style={{background: getGradient()}}>
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

    function getGradient(): string | undefined {
        return props.color
            ? "radial-gradient(ellipse at bottom, " + getColorLight() + " 0%, " + getColorDark() + " 90%)"
            : undefined;
    }

    function getColorLight(): string {
        if (props.color) {
            const factor = 0.8;
            return Color.toCss({
                red: props.color.red * factor,
                green: props.color.green * factor,
                blue: props.color.blue * factor,
            });
        } else {
            return "lightgray";
        }
    }

    function getColorDark(): string {
        if (props.color) {
            const factor = 0.35;
            return Color.toCss({
                red: props.color.red * factor,
                green: props.color.green * factor,
                blue: props.color.blue * factor,
            });
        } else {
            return "darkgray";
        }
    }
}