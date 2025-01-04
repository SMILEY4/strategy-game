import React, {ReactElement} from "react";
import {HBox} from "../layout/hbox/HBox";
import {BiSolidRightArrowAlt} from "react-icons/bi";
import {joinClassNames} from "../window/utils";
import "./changeInfoText.less";
import {Txt} from "../text/Txt";

export interface ChangeInfoTextProps {
	prevValue: any,
	nextValue: any | null
	fillParent?: boolean,
	secondary?: boolean,
	className?: string
}

export function ChangeInfoText(props: ChangeInfoTextProps): ReactElement {
	return (
		<HBox
			className={joinClassNames([
				"change-info-text",
				props.secondary === true ? "change-info-text--secondary" : null,
				props.className,
			])}
			centerVertical
			fullSize={props.fillParent}
		>

			<Txt.Body className="change-info-text__prev">
				<Txt.String>{props.prevValue}</Txt.String>
			</Txt.Body>

			{props.nextValue !== null && props.nextValue !== undefined && props.nextValue !== props.prevValue && (
				<>
					<BiSolidRightArrowAlt className="change-info-text__next"/>
					<Txt.Body className="change-info-text__next">
						<Txt.String>{props.nextValue}</Txt.String>
					</Txt.Body>
				</>
			)}

		</HBox>
	);
}