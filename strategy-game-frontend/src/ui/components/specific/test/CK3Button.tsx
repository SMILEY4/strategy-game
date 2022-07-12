import {ReactElement} from "react";
import "./ck3button.css"

/**
 * Simple button-component for TESTING purposes
 * style copied from crusader kings 3:
 * https://web.archive.org/web/20211124025533/https://www.crusaderkings.com/en/pc#about
 */
export function CK3Button(props: {
	children: any,
}): ReactElement {

	return (
		<div className="ck3button">
			<div className="ck3button__content">
				{props.children}
			</div>
			<div className="ck3button__background">
				<div className="ck3button__border">
					<div className={"ck3button__border__top"}/>
					<div className={"ck3button__border__bottom"}/>
					<div className={"ck3button__border__left"}/>
					<div className={"ck3button__border__right"}/>
				</div>
			</div>
		</div>
	)

}
