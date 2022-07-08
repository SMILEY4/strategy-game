import {ReactElement} from "react";
import "./button.css"

/**
 * Simple button-component for TESTING purposes
 */
export function Button(props: {
	children: any,
	style: "default" | "info" | "warn" | "error",
	disabled: boolean,
}): ReactElement {

	return (
		<div className={"button button-" + props.style + (props.disabled ? " button-disabled" : "")} onClick={handleClick}>
			{props.children}
		</div>
	)

	function handleClick() {
		if (!props.disabled && props.onAction) {
			props.onAction()
		}
	}

}
