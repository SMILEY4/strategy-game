import {useRef, useState} from "react";

export function useTextInput(value: string, disabled: boolean, onAccept?: (value: string) => void) {

	const [currentValue, setCurrentValue] = useState(value)
	const shouldIgnoreBlur = useRef(false)

	function updateValue(newValue: string) {
		if (!disabled) {
			setCurrentValue(newValue)
		}
	}

	function commitValue() {
		if (!disabled) {
			onAccept && onAccept(currentValue)
		}
	}

	function discardValue() {
		if (!disabled) {
			setCurrentValue(value)
		}
	}

	function onChange(e: any) {
		updateValue(e.target.value)
	}

	function onBlur() {
		if (!shouldIgnoreBlur.current) {
			commitValue()
		}
		shouldIgnoreBlur.current = false
	}

	function onKeyDown(e: any) {
		if (e.code === "Enter") {
			shouldIgnoreBlur.current = true
			e.stopPropagation()
			commitValue()
			e.target.blur()
		} else if (e.code === "Escape") {
			shouldIgnoreBlur.current = true
			e.stopPropagation()
			discardValue()
			e.target.blur()
		}
	}

	return {
		currentValue: currentValue,
		isDisabled: disabled,
		handleChange: onChange,
		handleBlur: onBlur,
		handleKeyDown: onKeyDown
	}
}
