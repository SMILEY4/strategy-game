import React, {ReactElement} from "react";
import {joinClassNames} from "../window/utils";
import "./banner.scoped.less";
import {Color} from "../../../models/base/color";
import {HBox} from "../layout/hbox/HBox";
import {BaseProps} from "../base/base";
import {Txt} from "../text/Txt";

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
                    <Txt.Header2 center>
                        <Txt.String>{props.title}</Txt.String>
                    </Txt.Header2>
                )}
                {props.subtitle && (
                    <Txt.Body center className="banner__subtitle">
                        <Txt.String>{props.subtitle}</Txt.String>
                    </Txt.Body>
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