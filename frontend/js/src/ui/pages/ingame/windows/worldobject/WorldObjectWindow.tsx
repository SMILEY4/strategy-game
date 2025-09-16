import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {UseWorldObjectWindow} from "./useWorldObjectWindow";
import {Button} from "../../../../components/button/Button";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Divider} from "../../../../components/divider/Divider";
import {Txt} from "../../../../components/text/Txt";
import {WorldObjectId} from "../../../../../models/worldobject/worldObjectId";

export interface WorldObjectWindowProps {
	windowId: string;
	identifier: WorldObjectId | null;
}

export function WorldObjectWindow(props: WorldObjectWindowProps): ReactElement {

	const data: UseWorldObjectWindow.Data | null = UseWorldObjectWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
				<Txt.Body center fullSize>
					<Txt.String>No object selected</Txt.String>
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
							</>
						)}
					</VBox>
				</VBox>
			</DecoratedWindow>
		);
	}

}
