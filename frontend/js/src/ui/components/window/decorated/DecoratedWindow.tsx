import React, {CSSProperties, ReactElement} from "react";
import {DecoratedPanel} from "../../panels/decorated/DecoratedPanel";
import {joinClassNames} from "../utils";
import {Button} from "../../button/Button";
import "./decoratedWindow.less";
import {useWindowInteractions} from "../windowHooks";
import {Txt} from "../../text/Txt";

export interface DecoratedWindowProps {
	windowId: string;
	withCloseButton?: boolean;
	withPinButton?: boolean;
	onClose?: () => void;
	style?: CSSProperties
	noPadding?: boolean,
	className?: string,
	children?: any;
}

export function DecoratedWindow(props: DecoratedWindowProps): ReactElement {

	const {
		dragProps,
		resizerProps,
		refContent,
		closeWindow,
		pinWindow,
		isPinned,
	} = useWindowInteractions(props.windowId);

	function handleClose() {
		props.onClose && props.onClose();
		closeWindow();
	}

	return (
		<DecoratedPanel
			ornament
			className={joinClassNames(["decorated-window", props.className])}
			elementRef={refContent}
			style={{
				minWidth: "min-content",
				minHeight: "200px",
				...props.style,
			}}
		>

			<div className="decorated-window__content">
				{props.children}
			</div>

			<div {...dragProps} className="decorated-window__drag-area"/>

			<div {...resizerProps} className="decorated-window__resize-area"/>

			{props.withPinButton && (
				<Button warn circle className="decorated-window__pin" disabled={isPinned} onClick={pinWindow}
						soundId={"CLICK_PRIMARY"}>
					<Txt.Icon.Pin/>
				</Button>
			)}

			{props.withCloseButton && (
				<Button warn circle className="decorated-window__close" onClick={handleClose}
						soundId={"CLICK_CLOSE"}>
					<Txt.Icon.Close/>
				</Button>
			)}


		</DecoratedPanel>
	);
}