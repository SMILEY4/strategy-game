import {ReactElement} from "react";
import {useButton} from "../../primitives/buttonPrimitive";

export function Button(props: { children: any, disabled: boolean, onAction: () => Promise<void> }): ReactElement {

	const {
		isDisabled,
		isLoading,
		handleClick
	} = useButton(true, props.disabled, handleAction)

	function handleAction(): Promise<void> {
		return props.onAction()
	}

	return (
		<div className={"button" + (isDisabled ? "button-disabled" : "")} onClick={handleClick}>
			{!isLoading && props.children}
			{isLoading && "Loading..."}
		</div>
	)

}
