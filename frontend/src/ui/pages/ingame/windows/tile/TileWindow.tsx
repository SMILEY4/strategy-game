import React, {ReactElement} from "react";
import {TileIdentifier} from "../../../../../models/base/tile";
import {UseTileWindow} from "./useTileWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {mapHiddenOrDefault} from "../../../../../common/hiddenType";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {TabBar, TabOption} from "../../../../components/tab/TabBar";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {EnrichedText} from "../../../../components/textenriched/EnrichedText";
import {ETImageIcon} from "../../../../components/textenriched/elements/ETImageIcon";
import {Case, Switch} from "react-if";
import {TileResourceType} from "../../../../../models/base/TileResourceType";
import {Divider} from "../../../../components/divider/Divider";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {Color} from "../../../../../models/base/color";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Banner} from "../../../../components/banner/Banner";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Visibility} from "../../../../../models/base/visibility";
import {VSpacer} from "../../../../components/spacer/Spacer";
import {Button} from "../../../../components/button/Button";
import {RxEyeOpen} from "react-icons/rx";
import {Txt} from "../../../../components/text/Txt";

export interface TileWindowProps {
	windowId: string;
	identifier: TileIdentifier | null;
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
						<Button circle small onClick={data.centerCamera}><RxEyeOpen/></Button>
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
		<SectionControlledBy {...props}/>
	);
}

function PanelDebug(props: UseTileWindow.Data): ReactElement {
	return (
		<>
			<InsetKeyValueGrid dontGrow dontShrink>

				<EnrichedText>Tile Id:</EnrichedText>
				<EnrichedText>{props.tile.identifier.id}</EnrichedText>

				<EnrichedText>Location:</EnrichedText>
				<EnrichedText>{props.tile.identifier.q + "," + props.tile.identifier.r}</EnrichedText>

			</InsetKeyValueGrid>
		</>
	);
}

function SectionBaseInformation(props: UseTileWindow.Data): ReactElement {
	return (
		<InsetKeyValueGrid dontGrow dontShrink>

			<EnrichedText>Terrain:</EnrichedText>
			{!props.tile.base.visible && (
				<EnrichedText>unknown</EnrichedText>
			)}
			{props.tile.base.visible && (
				<EnrichedText>{props.tile.base.value.terrainType.id}</EnrichedText>
			)}

			<EnrichedText>Resource:</EnrichedText>
			{!props.tile.base.visible && (
				<EnrichedText>unknown</EnrichedText>
			)}
			{(props.tile.base.visible && props.tile.base.value.resourceType === TileResourceType.NONE) && (
				<EnrichedText>{props.tile.base.value.resourceType.id}</EnrichedText>
			)}
			{(props.tile.base.visible && props.tile.base.value.resourceType !== TileResourceType.NONE) && (
				<EnrichedText><ETImageIcon
					url={props.tile.base.value.resourceType.getIconPath()}/> {props.tile.base.value.resourceType.id}
				</EnrichedText>
			)}

			<EnrichedText>Location:</EnrichedText>
			<EnrichedText>{props.tile.identifier.q + "," + props.tile.identifier.r}</EnrichedText>

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

			{(props.tile.visibility === Visibility.VISIBLE && props.tile.objects.length === 0) && (
				<Txt.Body secondary center>
					<Txt.String>Nothing on this tile.</Txt.String>
				</Txt.Body>
			)}

			{props.tile.objects.length > 0 && (
				<InsetPanel grow>
					<VBox padding_s gap_s fullSize>
						{props.tile.objects.map(tileObject => (

							<DecoratedPanel
								key={tileObject.settlement?.id + "/" + tileObject.worldObject?.id}
								background={
									<DecoratedPanel.ColorBackground color={Color.toCss(tileObject.country.color)}/>
								}
								blue
								pattern
								dontGrow
								dontShrink
							>
								<Switch>
									<Case condition={tileObject.settlement != null}>
										<HBox padding_s gap_s spaceBetween centerVertical>
											<Txt.Body>
												<Txt.Link onClick={() => props.open.tileObject(tileObject)}>
													<Txt.String>{tileObject.settlement?.name}</Txt.String>
												</Txt.Link>
											</Txt.Body>
											<Txt.Body secondary><Txt.String>Settlement</Txt.String></Txt.Body>
										</HBox>
									</Case>
									<Case condition={tileObject.worldObject != null}>
										<HBox padding_s gap_s spaceBetween centerVertical>
											<Txt.Body>
												<Txt.Link onClick={() => props.open.tileObject(tileObject)}>
													<Txt.String>{tileObject.worldObject?.type.id}</Txt.String>
												</Txt.Link>
											</Txt.Body>
											<Txt.Body secondary><Txt.String>Unit</Txt.String></Txt.Body>
										</HBox>
									</Case>
								</Switch>
							</DecoratedPanel>

						))}
					</VBox>
				</InsetPanel>
			)}
		</VBox>
	);
}

function SectionControlledBy(props: UseTileWindow.Data): ReactElement {
	return (
		<InsetPanel dontShrink>
			<VBox padding_s gap_s fullSize>

				<Txt.Body secondary>
					<Txt.String>Controlled by:</Txt.String>
				</Txt.Body>

				{!props.tile.political.visible && (
					<Txt.Body secondary center>
						<Txt.String>Unknown</Txt.String>
					</Txt.Body>
				)}

				{(props.tile.political.visible && props.tile.political.value.controlledBy == null) && (
					<Txt.Body secondary center>
						<Txt.String>Unclaimed</Txt.String>
					</Txt.Body>
				)}

				{(props.tile.political.visible && props.tile.political.value.controlledBy != null) && (
					<DecoratedPanel
						blue
						pattern
						background={
							<DecoratedPanel.ColorBackground
								color={Color.toCss(props.tile.political.value.controlledBy?.country.color!)}
							/>
						}
					>
						<VBox padding_m gap_xs>
							<Txt.Header3>
								<Txt.String>{props.tile.political.value.controlledBy?.country.name}</Txt.String>
							</Txt.Header3>
							<Txt.Body>
								<Txt.Link onClick={props.open.controllingSettlement}>
									<Txt.String>{props.tile.political.value.controlledBy?.settlement.name}</Txt.String>
								</Txt.Link>
							</Txt.Body>
						</VBox>
					</DecoratedPanel>
				)}

			</VBox>
		</InsetPanel>
	);
}