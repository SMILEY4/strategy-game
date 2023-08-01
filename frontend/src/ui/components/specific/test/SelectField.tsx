import {ReactElement, useLayoutEffect, useRef, useState} from "react";
import "./selectField.css"

const ITEMS = [
	{
		id: "de",
		title: "German"
	},
	{
		id: "en",
		title: "English"
	},
	{
		id: "fr",
		title: "French"
	},
	{
		id: "it",
		title: "Italian"
	},
	{
		id: "esp",
		title: "Spanish"
	},
	{
		id: "pl",
		title: "Polish"
	},
	{
		id: "sw",
		title: "Swedish"
	}
]

export function SelectField(props: {}): ReactElement {

	const [open, setOpen] = useState(false)
	const refField = useRef<HTMLDivElement>(null)
	const refMenu = useRef<HTMLDivElement>(null)
	const [menuPos, setMenuPos] = useState({side: "bottom", yOffset: 0})

	let resizeTimer: NodeJS.Timeout | null = null
	window.addEventListener("resize", () => {
		resizeTimer && clearInterval(resizeTimer)
		resizeTimer = setTimeout(handleResize, 100)
	})

	useLayoutEffect(() => {
		calculateMenuSide()
	}, [open])

	function handleResize() {
		calculateMenuSide()
	}

	function handleClick() {
		if (open) {
			setOpen(false)
		} else {
			setOpen(true)
		}
	}

	function calculateMenuSide() {
		if (open && refMenu.current && refField.current) {
			const viewportHeight = window.innerHeight
			const menuY = refField.current.getBoundingClientRect().y + refField.current.getBoundingClientRect().height
			const menuHeight = refMenu.current.getBoundingClientRect().height
			if (menuY + menuHeight < viewportHeight) {
				setMenuPos({side: "bottom", yOffset: 0})
			} else {
				setMenuPos({side: "top", yOffset: -menuHeight})
			}
		}
	}


	return (
		<div className={"select-wrapper"}>
			<div className={"select-field"} onClick={handleClick} ref={refField}>
			</div>
			{open && (
				<div className={"select-menu-" + menuPos.side} ref={refMenu}
					 style={{translate: "0 " + menuPos.yOffset + "px"}}>
					<div className={"select-menu-list"}>
						{ITEMS.map(item => (
							<div key={item.id} className={"select-item"}>{item.title}</div>
						))}
					</div>
				</div>
			)}
		</div>
	)

}
