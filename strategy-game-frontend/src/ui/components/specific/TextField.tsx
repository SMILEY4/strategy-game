import {ReactElement} from "react";
import {useTextInput} from "../primitives/textInputPrimitive";

export function TextField(props: {value: string, onAccept: (value: string) => void}): ReactElement {

	const {
		currentValue,
		isDisabled,
		handleChange,
		handleBlur,
		handleKeyDown
	} = useTextInput(props.value, false, props.onAccept)

	return (
		<input
			type="text"
			value={currentValue}
			placeholder=""
			disabled={isDisabled}
			onChange={handleChange}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
		/>
	)
}
