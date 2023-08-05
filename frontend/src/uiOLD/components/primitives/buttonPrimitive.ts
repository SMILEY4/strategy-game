import {useState} from "react";

/**
 * @param enableLoading whether the button will enter a loading state after clicking. State can be stopped using "doneLoading"
 * @param disabled whether this button is disabled
 * @param onAction the action to perform when clicking on the button
 */
export function useButton(enableLoading: boolean, disabled: boolean, onAction?: () => any | Promise<any>) {

	const [loading, setLoading] = useState(false)

	function onClick() {
		if (!disabled && !loading && onAction) {
			if (enableLoading) {
				setLoading(true)
			}
			Promise.resolve(onAction())
				.then(() => enableLoading && setLoading(false))
		}
	}

	return {
		isLoading: loading,
		isDisabled: disabled,
		handleClick: onClick,
	}

}
