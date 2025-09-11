import React, {ReactElement} from "react";
import {Button} from "../../../components/button/Button";
import {HBox} from "../../../components/layout/hbox/HBox";
import {HSpacer} from "../../../components/spacer/Spacer";
import "./menubar.less";
import {UseDevWindow} from "../windows/dev/useDevWindow";
import {UseMapWindow} from "../windows/map/useMapWindow";
import {UseCommandLogWindow} from "../windows/commandlog/useCommandLogWindow";
import {useIsBlockingWindowOpen} from "../../../components/window/windowHooks";
import {UseOutlinerWindow} from "../windows/outliner/useOutlinerWindow";
import {Txt} from "../../../components/text/Txt";
import {App} from "../../../../appContext";
import {GameStateHooks} from "../../../../state/gameStateHooks";

export function MenuBar(): ReactElement {

	const currentTurn = GameStateHooks.useCurrentTurn();
	const isWaiting = GameStateHooks.useIsGameWaiting();
	const isBlocked = useIsBlockingWindowOpen();

	return (
		<div className="menubar">
			<div className="menubar__inner">
				<HBox fullSize padding_xs gap_xs className="menubar__content">

					<Button circle onClick={UseDevWindow.open} disabled={isBlocked}><Txt.Icon.Debug/></Button>
					<Button circle onClick={UseMapWindow.open} disabled={isBlocked}><Txt.Icon.Map/></Button>
					<Button circle onClick={UseCommandLogWindow.open} disabled={isBlocked}><Txt.Icon.Command/></Button>
					<Button circle onClick={UseOutlinerWindow.open} disabled={isBlocked}><Txt.Icon.List/></Button>

					<HSpacer fullWidth/>

					<Button success disabled={isBlocked || isWaiting} onClick={() => App.gameProxy.endTurn()}>
						{"End Turn " + currentTurn}
					</Button>

				</HBox>
			</div>
		</div>
	);

}