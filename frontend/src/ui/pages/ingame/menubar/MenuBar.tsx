import React, {ReactElement} from "react";
import {ButtonPrimary} from "../../../components/button/primary/ButtonPrimary";
import {HBox} from "../../../components/layout/hbox/HBox";
import {Spacer} from "../../../components/spacer/Spacer";
import {CgDebug} from "react-icons/cg";
import {FiHexagon, FiMap} from "react-icons/fi";
import "./menubar.scoped.less";
import {UseDevWindow} from "../windows/dev/useDevWindow";
import {UseMapWindow} from "../windows/map/useMapWindow";
import {UseTileWindow} from "../windows/tile/useTileWindow";
import {PiScrollBold} from "react-icons/pi";
import {UseCommandLogWindow} from "../windows/commandlog/useCommandLogWindow";
import {useDI} from "../../../../appContext";
import {TurnEndService} from "../../../../logic/game/turnEndService";
import {SessionRepository} from "../../../../state/repository/sessionRepository";
import {useIsBlockingWindowOpen} from "../../../components/window/windowHooks";

export function MenuBar(): ReactElement {

	const openDevMenu = UseDevWindow.useOpen();
	const openMapMenu = UseMapWindow.useOpen();
	const openCommandLogMenu = UseCommandLogWindow.useOpen();
	const openTileMenu = UseTileWindow.useOpen();
	const currentTurn = SessionRepository.useTurn();
	const [endTurnDisabled, endTurn] = useEndTurn();

	return (
		<div className="menubar">
			<div className="menubar__inner">
				<HBox padding_xs gap_xs fillParent className="menubar__content">

					<ButtonPrimary blue round onClick={openDevMenu}>
						<CgDebug/>
					</ButtonPrimary>

					<ButtonPrimary blue round onClick={openMapMenu}>
						<FiMap/>
					</ButtonPrimary>

					<ButtonPrimary blue round onClick={openCommandLogMenu}>
						<PiScrollBold/>
					</ButtonPrimary>

					<ButtonPrimary blue round onClick={() => openTileMenu(null)}>
						<FiHexagon/>
					</ButtonPrimary>

					<Spacer size="fill"/>

					<ButtonPrimary green disabled={endTurnDisabled} onClick={endTurn}>
						{"End Turn " + currentTurn}
					</ButtonPrimary>
				</HBox>
			</div>
		</div>
	);

}

function useEndTurn(): [boolean, () => void] {
	const isBlocked = useIsBlockingWindowOpen();
	const isWaiting = SessionRepository.useGameTurnState() === "waiting";
	const isDisabled = isBlocked || isWaiting;

	const endTurnService = useDI<TurnEndService>(TurnEndService.name);

	function endTurn() {
		endTurnService.endTurn();
	}

	return [isDisabled, endTurn];
}