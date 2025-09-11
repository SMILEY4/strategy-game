import React, {ReactElement} from "react";
import {BaseProps} from "../base/base";
import {joinClassNames} from "../window/utils";
import "./txt.scoped.less";
import {PiListBold, PiScrollBold} from "react-icons/pi";
import {NumberFormatter} from "../headless/numberFormatter";
import {FaArrowDown, FaHome, FaSearch} from "react-icons/fa";
import {CgClose, CgDebug} from "react-icons/cg";
import {FiHexagon, FiMap, FiPlus} from "react-icons/fi";
import {RiPushpinFill} from "react-icons/ri";
import {RxEyeOpen} from "react-icons/rx";
import {BiSolidLeftArrowAlt, BiSolidRightArrowAlt} from "react-icons/bi";
import {FaArrowUp} from "react-icons/fa6";
import {TbPointFilled} from "react-icons/tb";

export namespace Txt {

	type AtomicChildType =
		| ReactElement<StringProps>
		| ReactElement<NumberProps>
		| ReactElement<IconProps>
		| ReactElement<WhitespaceProps>
		| undefined

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
		level: 1 | 2 | 3 | 4 | 5,
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

	export function Header5(props: Omit<HeaderProps, "level">): ReactElement {
		return <Header {...props} level={4} children={props.children}/>;
	}

	export interface LinkProps {
		onClick?: () => void;
		children: AtomicChildType | AtomicChildType[];
	}

	export function Link(props: LinkProps): ReactElement {
		return <span onClick={props.onClick} className="txt-link">{props.children}</span>;
	}

	export interface WhitespaceProps {
	}

	export function Whitespace(props: WhitespaceProps): ReactElement {
		return <span className="txt-whitespace"> </span>;
	}

	export interface StringProps {
		positive?: boolean,
		negative?: boolean,
		children?: string;
	}

	export function String(props: StringProps): ReactElement {
		return (
			<span className={joinClassNames([
				"txt-string",
				props.positive ? "txt-string--positive" : null,
				props.negative ? "txt-string--negative" : null,
			])}>
				{props.children}
			</span>
		);
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

		// suffix to append after the number
		suffix?: string,

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
			suffix: props.suffix
		});

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
			if (classification === "good") return "positive";
			if (classification === "bad") return "negative";
			return "neutral";
		}
	}

	export function Percentage(props: NumberProps): ReactElement {
		return (
			<Number suffix="%" {...props}>{props.children * 100}</Number>
		)
	}


	export interface IconProps {
		name: string;
		className?: string,
	}

	export function Icon(props: IconProps): ReactElement {

		if (props.name === "close") return <CgClose className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "plus") return <FiPlus className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "command") return <PiScrollBold className={joinClassNames(["txt-icon txt-icon--svg", props.className])}/>;
		if (props.name === "home") return <FaHome className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "search") return <FaSearch className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "debug") return <CgDebug className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "map") return <FiMap className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "tile") return <FiHexagon className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "list") return <PiListBold className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "pin") return <RiPushpinFill className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "eye") return <RxEyeOpen className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "arrow-right") return <BiSolidRightArrowAlt className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "arrow-left") return <BiSolidLeftArrowAlt className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "arrow-up") return <FaArrowUp className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "arrow-down") return <FaArrowDown className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;
		if (props.name === "point") return <TbPointFilled className={joinClassNames(["txt-icon", "txt-icon--svg", props.className])}/>;

		if (props.name === "armor") return <ImageIcon url="/icons/resources/ARMOR.png" className={props.className}/>;
		if (props.name === "barrel") return <ImageIcon url="/icons/resources/BARREL.png" className={props.className}/>;
		if (props.name === "clothes") return <ImageIcon url="/icons/resources/CLOTHES.png" className={props.className}/>;
		if (props.name === "fish") return <ImageIcon url="/icons/resources/FISH.png" className={props.className}/>;
		if (props.name === "food") return <ImageIcon url="/icons/resources/FOOD.png" className={props.className}/>;
		if (props.name === "hide") return <ImageIcon url="/icons/resources/HIDE.png" className={props.className}/>;
		if (props.name === "horse") return <ImageIcon url="/icons/resources/HORSE.png" className={props.className}/>;
		if (props.name === "jewelleries") return <ImageIcon url="/icons/resources/JEWELLERIES.png" className={props.className}/>;
		if (props.name === "metal") return <ImageIcon url="/icons/resources/METAL.png" className={props.className}/>;
		if (props.name === "money") return <ImageIcon url="/icons/resources/MONEY.png" className={props.className}/>;
		if (props.name === "parchment") return <ImageIcon url="/icons/resources/PARCHMENT.png" className={props.className}/>;
		if (props.name === "stone") return <ImageIcon url="/icons/resources/STONE.png" className={props.className}/>;
		if (props.name === "tools") return <ImageIcon url="/icons/resources/TOOLS.png" className={props.className}/>;
		if (props.name === "weapon") return <ImageIcon url="/icons/resources/WEAPON.png" className={props.className}/>;
		if (props.name === "wine") return <ImageIcon url="/icons/resources/WINE.png" className={props.className}/>;
		if (props.name === "wood") return <ImageIcon url="/icons/resources/WOOD.png" className={props.className}/>;

		throw new Error("Unknown icon name: " + props.name);

		function ImageIcon(props: { url: string, className?: string }): ReactElement {
			return (
				<span
					className={joinClassNames(["txt-icon", "txt-icon--image", props.className])}
					style={{
						backgroundImage: `url(${props.url})`,
					}}
				/>
			);
		}

	}

	export namespace Icon {

		export function Close(props: {className?: string}): ReactElement {
			return <Txt.Icon name="close" className={props.className}/>;
		}

		export function Plus(props: {className?: string}): ReactElement {
			return <Txt.Icon name="plus" className={props.className}/>;
		}

		export function ArrowRight(props: {className?: string}): ReactElement {
			return <Txt.Icon name="arrow-right" className={props.className}/>;
		}

		export function ArrowLeft(props: {className?: string}): ReactElement {
			return <Txt.Icon name="arrow-left" className={props.className}/>;
		}

		export function ArrowUp(props: {className?: string}): ReactElement {
			return <Txt.Icon name="arrow-up" className={props.className}/>;
		}

		export function ArrowDown(props: {className?: string}): ReactElement {
			return <Txt.Icon name="arrow-down" className={props.className}/>;
		}

		export function Point(props: {className?: string}): ReactElement {
			return <Txt.Icon name="arrow-point" className={props.className}/>;
		}

		export function Command(props: {className?: string}): ReactElement {
			return <Txt.Icon name="command" className={props.className}/>;
		}

		export function Home(props: {className?: string}): ReactElement {
			return <Txt.Icon name="home" className={props.className}/>;
		}

		export function Search(props: {className?: string}): ReactElement {
			return <Txt.Icon name="search" className={props.className}/>;
		}

		export function Debug(props: {className?: string}): ReactElement {
			return <Txt.Icon name="debug" className={props.className}/>;
		}

		export function Map(props: {className?: string}): ReactElement {
			return <Txt.Icon name="map" className={props.className}/>;
		}

		export function Tile(props: {className?: string}): ReactElement {
			return <Txt.Icon name="tile" className={props.className}/>;
		}

		export function List(props: {className?: string}): ReactElement {
			return <Txt.Icon name="list" className={props.className}/>;
		}

		export function Pin(props: {className?: string}): ReactElement {
			return <Txt.Icon name="pin"/>;
		}

		export function Eye(props: {className?: string}): ReactElement {
			return <Txt.Icon name="eye" className={props.className}/>;
		}

		export function Armor(props: {className?: string}): ReactElement {
			return <Txt.Icon name="armor" className={props.className}/>;
		}

		export function Barrel(props: {className?: string}): ReactElement {
			return <Txt.Icon name="barrel" className={props.className}/>;
		}

		export function Clothes(props: {className?: string}): ReactElement {
			return <Txt.Icon name="clothes" className={props.className}/>;
		}

		export function Fish(props: {className?: string}): ReactElement {
			return <Txt.Icon name="fish" className={props.className}/>;
		}

		export function Food(props: {className?: string}): ReactElement {
			return <Txt.Icon name="food" className={props.className}/>;
		}

		export function Hide(props: {className?: string}): ReactElement {
			return <Txt.Icon name="hide" className={props.className}/>;
		}

		export function Horse(props: {className?: string}): ReactElement {
			return <Txt.Icon name="horse" className={props.className}/>;
		}

		export function Jewelleries(props: {className?: string}): ReactElement {
			return <Txt.Icon name="jewelleries" className={props.className}/>;
		}

		export function Metal(props: {className?: string}): ReactElement {
			return <Txt.Icon name="metal" className={props.className}/>;
		}

		export function Money(props: {className?: string}): ReactElement {
			return <Txt.Icon name="money" className={props.className}/>;
		}

		export function Parchment(props: {className?: string}): ReactElement {
			return <Txt.Icon name="parchment" className={props.className}/>;
		}

		export function Stone(props: {className?: string}): ReactElement {
			return <Txt.Icon name="stone" className={props.className}/>;
		}

		export function Tools(props: {className?: string}): ReactElement {
			return <Txt.Icon name="tools" className={props.className}/>;
		}

		export function Weapon(props: {className?: string}): ReactElement {
			return <Txt.Icon name="weapon" className={props.className}/>;
		}

		export function Wine(props: {className?: string}): ReactElement {
			return <Txt.Icon name="wine" className={props.className}/>;
		}

		export function Wood(props: {className?: string}): ReactElement {
			return <Txt.Icon name="wood" className={props.className}/>;
		}
	}

}