import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Button} from "../../../../components/button/Button";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";
import {UseUnitWindow} from "./useUnitWindow";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {WorldObject} from "../../../../../models/worldobject/worldObject";
import UnitMoveAction = UseUnitWindow.UnitMoveAction;
import UnitDisbandAction = UseUnitWindow.UnitDisbandAction;
import UnitCancelCurrentCommandAction = UseUnitWindow.UnitCancelCurrentCommandAction;

export interface UnitWindowProps {
	windowId: string;
	identifier: WorldObject.Id | null;
}

export function UnitWindow(props: UnitWindowProps): ReactElement {

	const data: UseUnitWindow.Data | null = UseUnitWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
				<Txt.Body center fullSize>
					<Txt.String>No unit selected</Txt.String>
				</Txt.Body>
			</DecoratedWindow>
		);
	} else {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton noPadding>
				<VBox fullSize>

					<Banner
						title={data.worldObject.type.group + "/" + data.worldObject.type.name}
						subtitle={"Unit"}
						color={data.worldObject.realm.color}
						spaceAbove
					>
						<Button circle small onClick={data.open.tile}><Txt.Icon.Tile/></Button>
						<Button circle small onClick={data.centerCamera}><Txt.Icon.Eye/></Button>
					</Banner>

					<VBox padding_l gap_m scrollable grow shrink>
						{data.worldObject.realm.ownedByUser && (
							<>
								<Txt.Header2 center>
									<Txt.String>Actions</Txt.String>
								</Txt.Header2>
								<Divider line/>

								<InsetPanel dontShrink dontGrow>
									<VBox padding_s gap_s fullSize>
										{data.actions.map(action => {

											if (action.type === "move") {
												const actionMove = action as UnitMoveAction;
												return (
													<Button disabled={!actionMove.enabled} onClick={actionMove.perform}
															key={action.type}>
														Move
													</Button>
												);
											}

											if (action.type === "disband") {
												const actionDisband = action as UnitDisbandAction;
												return (
													<Button disabled={!actionDisband.enabled}
															onClick={actionDisband.perform} key={action.type}>
														Disband
													</Button>
												);
											}

											if (action.type === "cancel-current-command") {
												const actionCancel = action as UnitCancelCurrentCommandAction;
												return (
													<Button disabled={!actionCancel.enabled}
															onClick={actionCancel.perform} key={action.type}>
														Cancel Command
													</Button>
												);
											}

											// exhaustiveness check: syntax error in case of unhandled action type
											// noinspection UnnecessaryLocalVariableJS
											const _exhaustive: never = action;
											throw new Error("Unexpected action type: " + _exhaustive);
										})}
									</VBox>
								</InsetPanel>

							</>
						)}
					</VBox>
				</VBox>
			</DecoratedWindow>
		);
	}

}
