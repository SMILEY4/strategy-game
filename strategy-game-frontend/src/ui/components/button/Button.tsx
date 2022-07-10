import {ReactElement} from "react";
import "./button.css"

/**
 * Simple button-component for TESTING purposes
 * style copied from crusader kings 3:
 * https://web.archive.org/web/20211124025533/https://www.crusaderkings.com/en/pc#about
 */
export function Button(props: {
	children: any,
}): ReactElement {

	return (
		<div className="button">
			<div className="button__content">
				{props.children}
			</div>
			<div className="button__background">
				<div className="button__border">
					<div className={"button__border__top"}/>
					<div className={"button__border__bottom"}/>
					<div className={"button__border__left"}/>
					<div className={"button__border__right"}/>
				</div>
			</div>
		</div>
	)

}
