import React, {ReactElement} from "react";
import {BaseProps} from "../base/base";
import {joinClassNames} from "../window/utils";
import "./txt.scoped.less";
import {PiScrollBold} from "react-icons/pi";
import {NumberFormatter} from "../headless/numberFormatter";

export namespace Txt {

    type AtomicChildType =
        | ReactElement<StringProps>
        | ReactElement<NumberProps>
        | ReactElement<IconProps>
        | ReactElement<WhitespaceProps>

    export interface ContainerProps extends BaseProps {

        align?: "left" | "center" | "right"
        left?: boolean,
        center?: boolean,
        right?: boolean,

        secondary?: boolean,

        children: AtomicChildType | AtomicChildType[];
    }

    function getAlign(props: ContainerProps): "left" | "center" | "right" {
        if (props.align) return props.align;
        if (props.left) return "left";
        if (props.center) return "center";
        if (props.right) return "right";
        return "left";
    }

    export interface BodyProps extends ContainerProps {
    }

    export function Body(props: BodyProps): ReactElement {
        return (
            <div
                className={joinClassNames([
                    "txt-body",
                    "txt-body--" + getAlign(props),
                    props.secondary ? "txt-body--secondary" : null,
                    ...BaseProps.buildBaseClassNames(props),
                ])}
                style={props.style}
            >
                {props.children}
            </div>
        );
    }


    export interface HeaderProps extends ContainerProps {
        level: 1 | 2 | 3 | 4,
    }

    export function Header(props: HeaderProps): ReactElement {
        return (
            <div
                className={joinClassNames([
                    "txt-header",
                    "txt-header--" + props.level,
                    "txt-header--" + getAlign(props),
                    props.secondary ? "txt-header--secondary" : null,
                    ...BaseProps.buildBaseClassNames(props),
                ])}
                style={props.style}
            >
                {props.children}
            </div>
        );
    }

    export function Header1(props: Omit<HeaderProps, "level">): ReactElement {
        return <Header {...props} level={1} children={props.children}/>;
    }

    export function Header2(props: Omit<HeaderProps, "level">): ReactElement {
        return <Header {...props} level={2} children={props.children}/>;
    }

    export function Header3(props: Omit<HeaderProps, "level">): ReactElement {
        return <Header {...props} level={3} children={props.children}/>;
    }

    export function Header4(props: Omit<HeaderProps, "level">): ReactElement {
        return <Header {...props} level={4} children={props.children}/>;
    }

    export interface LinkProps {
        onClick?: () => void;
        children: AtomicChildType | AtomicChildType[];
    }

    export function Link(props: LinkProps): ReactElement {
        return <span className="txt-link">{props.children}</span>;
    }

    export interface WhitespaceProps {
    }

    export function Whitespace(props: WhitespaceProps): ReactElement {
        return <span className="txt-whitespace"> </span>;
    }

    export interface StringProps {
        children?: string;
    }

    export function String(props: StringProps): ReactElement {
        return <span className="txt-string">{props.children}</span>;
    }


    export interface NumberProps {
        // determines whether value should be classified "neutral", "good" or "bad"
        behaviour?: "neutral" | "less-is-better" | "more-is-better",
        referencePoint?: number,

        // determines when to a "+" or "-"
        signBehaviour?: "always" | "never" | "minus-only"
        zeroClassification?: "neutral" | "positive" | "negative"

        // determines general format of the given number
        decimalPlaces?: number,

        // the given number
        children: number;
    }

    export function Number(props: NumberProps): ReactElement {
        const formatResult = NumberFormatter.format(props.children, {
            behaviour: props.behaviour ?? "neutral",
            referencePoint: props.referencePoint ?? 0,
            signBehaviour: props.signBehaviour ?? "minus-only",
            zeroClassification: props.zeroClassification ?? "neutral",
            decimalPlaces: props.decimalPlaces ?? 0,
        })

        return (
            <span
                className={joinClassNames([
                    "txt-number",
                    "txt-number--" + getColor(formatResult.classification),
                ])}
            >
                {formatResult.value}
            </span>
        );

        function getColor(classification: "neutral" | "good" | "bad"): "neutral" | "negative" | "positive" {
            if(classification === "good") return "positive"
            if(classification === "bad") return "negative"
            return "neutral"
        }

    }


    export interface IconProps {
        name: string;
    }

    export function Icon(props: IconProps): ReactElement {
        if (props.name === "armor") return <ImageIcon url="/icons/resources/ARMOR.png"/>;
        if (props.name === "barrel") return <ImageIcon url="/icons/resources/BARREL.png"/>;
        if (props.name === "clothes") return <ImageIcon url="/icons/resources/CLOTHES.png"/>;
        if (props.name === "fish") return <ImageIcon url="/icons/resources/FISH.png"/>;
        if (props.name === "food") return <ImageIcon url="/icons/resources/FOOD.png"/>;
        if (props.name === "hide") return <ImageIcon url="/icons/resources/HIDE.png"/>;
        if (props.name === "horse") return <ImageIcon url="/icons/resources/HORSE.png"/>;
        if (props.name === "jewelleries") return <ImageIcon url="/icons/resources/JEWELLERIES.png"/>;
        if (props.name === "metal") return <ImageIcon url="/icons/resources/METAL.png"/>;
        if (props.name === "money") return <ImageIcon url="/icons/resources/MONEY.png"/>;
        if (props.name === "parchment") return <ImageIcon url="/icons/resources/PARCHMENT.png"/>;
        if (props.name === "stone") return <ImageIcon url="/icons/resources/STONE.png"/>;
        if (props.name === "tools") return <ImageIcon url="/icons/resources/TOOLS.png"/>;
        if (props.name === "weapon") return <ImageIcon url="/icons/resources/WEAPON.png"/>;
        if (props.name === "wine") return <ImageIcon url="/icons/resources/WINE.png"/>;
        if (props.name === "command") return <PiScrollBold className="txt-icon txt-icon--svg"/>;

        throw new Error("Unknown icon name: " + props.name);

        function ImageIcon(props: { url: string }): ReactElement {
            return (
                <span
                    className="txt-icon txt-icon--image"
                    style={{
                        backgroundImage: `url(${props.url})`,
                    }}
                />
            );
        }
    }

}