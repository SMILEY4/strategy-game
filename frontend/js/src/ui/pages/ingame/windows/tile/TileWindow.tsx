import React, {ReactElement} from "react";
import {UseTileWindow} from "./useTileWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {mapHiddenOrDefault} from "../../../../../common/hiddenType";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {TabBar, TabOption} from "../../../../components/tab/TabBar";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {Divider} from "../../../../components/divider/Divider";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Color} from "../../../../../common/color";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Banner} from "../../../../components/banner/Banner";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Visibility} from "../../../../../models/misc/visibility";
import {VSpacer} from "../../../../components/spacer/Spacer";
import {Button} from "../../../../components/button/Button";
import {Txt} from "../../../../components/text/Txt";
import {Projections} from "../../../../../common/webgl/projections";
import {Tile} from "../../../../../models/tile/tile";
import {TileResourceType} from "../../../../../models/misc/tileResourceType";

export interface TileWindowProps {
	windowId: string;
	identifier: Tile.Id | null;
}

export function TileWindow(props: TileWindowProps): ReactElement {

	const data: UseTileWindow.Data | null = UseTileWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
				<Txt.Body secondary center fullSize>
					<Txt.String>No tile selected.</Txt.String>
				</Txt.Body>
			</DecoratedWindow>
		);
	} else {

		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton noPadding>
				<VBox fullSize>

					<Banner
						title={mapHiddenOrDefault(data.tile.base, "Undiscovered", base => base.terrainType.id)}
						subtitle={"Tile"}
						spaceAbove
					>
						<Button circle small onClick={data.centerCamera}><Txt.Icon.Eye/></Button>
					</Banner>

					<TabBar initial="Overview">

						<TabOption name="Overview">
							<VBox grow shrink scrollable padding_s gap_m>
								<PanelOverview {...data}/>
							</VBox>
						</TabOption>

						<TabOption name="Political">
							<VBox grow shrink scrollable padding_s gap_m>
								<PanelPolitical {...data}/>
							</VBox>
						</TabOption>

						<TabOption name="D" circle>
							<VBox grow shrink scrollable padding_s gap_m>
								<PanelDebug {...data}/>
							</VBox>
						</TabOption>

					</TabBar>

				</VBox>
			</DecoratedWindow>
		);
	}

}


function PanelOverview(props: UseTileWindow.Data): ReactElement {
	return (
		<>
			<SectionBaseInformation {...props}/>
			<SectionContent {...props}/>
		</>
	);
}

function PanelPolitical(props: UseTileWindow.Data): ReactElement {
	return (
		<></>
	);
}

function PanelDebug(props: UseTileWindow.Data): ReactElement {
	const worldCoords = Projections.hexToWorld(props.tile.position.q, props.tile.position.r);
	return (
		<>
			<InsetKeyValueGrid dontGrow dontShrink>

				<Txt.Body><Txt.String>Tile Id:</Txt.String></Txt.Body>
				<Txt.Body><Txt.String>{props.tile.id}</Txt.String></Txt.Body>

				<Txt.Body><Txt.String>Location (hex):</Txt.String></Txt.Body>
				<Txt.Body><Txt.String>{props.tile.position.q + "," + props.tile.position.r}</Txt.String></Txt.Body>

				<Txt.Body><Txt.String>Location (world):</Txt.String></Txt.Body>
				<Txt.Body><Txt.String>{worldCoords.x + "," + worldCoords.y}</Txt.String></Txt.Body>


			</InsetKeyValueGrid>
		</>
	);
}

function SectionBaseInformation(props: UseTileWindow.Data): ReactElement {
	return (
		<InsetKeyValueGrid dontGrow dontShrink>

			<Txt.Body><Txt.String>Terrain:</Txt.String></Txt.Body>
			{!props.tile.base.visible && (
				<Txt.Body><Txt.String>unknown</Txt.String></Txt.Body>
			)}
			{props.tile.base.visible && (
				<Txt.Body><Txt.String>{props.tile.base.value.terrainType.id}</Txt.String></Txt.Body>
			)}

			<Txt.Body><Txt.String>Resource:</Txt.String></Txt.Body>
			{!props.tile.base.visible && (
				<Txt.Body><Txt.String>unknown</Txt.String></Txt.Body>
			)}
			{(props.tile.base.visible && props.tile.base.value.resourceType === TileResourceType.NONE) && (
				<Txt.Body><Txt.String>{props.tile.base.value.resourceType.id}</Txt.String></Txt.Body>
			)}
			{(props.tile.base.visible && props.tile.base.value.resourceType !== TileResourceType.NONE) && (
				<Txt.Body>
					<Txt.Icon name={props.tile.base.value.resourceType.id.toLowerCase()}/>
					<Txt.String>{props.tile.base.value.resourceType.id}</Txt.String>
				</Txt.Body>
			)}

			<Txt.Body><Txt.String>Location:</Txt.String></Txt.Body>
			<Txt.Body><Txt.String>{props.tile.position.q + "," + props.tile.position.r}</Txt.String></Txt.Body>

		</InsetKeyValueGrid>
	);
}


function SectionContent(props: UseTileWindow.Data): ReactElement {
	return (
		<VBox dontShrink gap_xs>

			<VSpacer size_s/>
			<Txt.Header2 center>
				<Txt.String>Content</Txt.String>
			</Txt.Header2>
			<Divider line/>

			{(props.tile.visibility !== Visibility.VISIBLE) && (
				<Txt.Body secondary center>
					<Txt.String>Unknown</Txt.String>
				</Txt.Body>
			)}

			{(props.tile.visibility === Visibility.VISIBLE && props.worldObjects.length === 0) && (
				<Txt.Body secondary center>
					<Txt.String>Nothing on this tile.</Txt.String>
				</Txt.Body>
			)}

			{props.worldObjects.length > 0 && (
				<InsetPanel grow>
					<VBox padding_s gap_s fullSize>
						{props.worldObjects.map(worldObject => (

							<DecoratedPanel
								key={worldObject.id}
								background={
									<DecoratedPanel.ColorBackground color={Color.toCss(worldObject.realm.color)}/>
								}
								blue
								pattern
								dontGrow
								dontShrink
							>
								<HBox padding_s gap_s spaceBetween centerVertical>
									<Txt.Body>
										<Txt.Link onClick={() => props.open.worldObject(worldObject.id)}>
											<Txt.String>{worldObject.type.group + "/" + worldObject.type.name}</Txt.String>
										</Txt.Link>
									</Txt.Body>
									<Txt.Body secondary><Txt.String>Unit</Txt.String></Txt.Body>
								</HBox>
							</DecoratedPanel>

						))}
					</VBox>
				</InsetPanel>
			)}
		</VBox>
	);
}
