import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {Button} from "../../../../components/button/Button";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";
import {UseWorldObjectWindow} from "./useWorldObjectWindow";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {WorldObject} from "../../../../../models/worldobject/worldObject";

export interface WorldObjectWindowProps {
	windowId: string;
	identifier: WorldObject.Id | null;
}

export function WorldObjectWindow(props: WorldObjectWindowProps): ReactElement {

	const data: UseWorldObjectWindow.Data | null = UseWorldObjectWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
				<Txt.Body center fullSize>
					<Txt.String>No world object selected</Txt.String>
				</Txt.Body>
			</DecoratedWindow>
		);
	} else {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton noPadding>
				<VBox fullSize>

					<Banner
						title={data.worldObject.type.group + "/" + data.worldObject.type.name}
						subtitle={"World Object"}
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
												return (
													<Button disabled={!action.enabled} onClick={action.perform} key={action.type}>
														Move
													</Button>
												);
											}

											if (action.type === "construct-tile-improvement") {
												return (
													<Button disabled={!action.enabled} onClick={action.perform} key={action.type}>
														Construct Tile Improvement
													</Button>
												);
											}

											if (action.type === "spawn-settlement") {
												return (
													<Button disabled={!action.enabled} onClick={action.perform} key={action.type}>
														Spawn Settlement
													</Button>
												);
											}

											if (action.type === "disband") {
												return (
													<Button disabled={!action.enabled} onClick={action.perform} key={action.type}>
														Disband
													</Button>
												);
											}

											if (action.type === "cancel-current-command") {
												return (
													<Button disabled={!action.enabled} onClick={action.perform} key={action.type}>
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
