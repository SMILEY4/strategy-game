import React, {ReactElement} from "react";
import {UseOutlinerWindow} from "./useOutlinerWindow";
import {Divider} from "../../../../components/divider/Divider";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {TabBar, TabOption} from "../../../../components/tab/TabBar";
import {HSpacer} from "../../../../components/spacer/Spacer";
import {Button} from "../../../../components/button/Button";
import {Txt} from "../../../../components/text/Txt";

export interface OutlinerWindowProps {
	windowId: string,
}

export function OutlinerWindow(props: OutlinerWindowProps): ReactElement {

	const data = UseOutlinerWindow.useData();

	return (
		<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
			<VBox padding_l gap_m fullSize>

				<Txt.Header1 center>
					<Txt.String>Outliner</Txt.String>
				</Txt.Header1>

				<Divider line/>

				<TabBar noPadding initial={"All"}>

					<TabOption name="All">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionRealms {...data}/>
								<SectionUnits {...data}/>
								<SectionTileImprovements {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

					<TabOption name="Realms">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionRealms {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

					<TabOption name="Units">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionUnits {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

					<TabOption name="Improvements">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionTileImprovements {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

				</TabBar>


			</VBox>
		</DecoratedWindow>
	);
}

function SectionRealms(props: UseOutlinerWindow.Data): ReactElement {
	return (
		<>
			{props.realms.entries.length > 0 && (
				<Txt.Header5>
					<Txt.String>Realms</Txt.String>
				</Txt.Header5>
			)}
			{props.realms.entries.map(realm => (
				<DecoratedPanel
					key={realm.id}
					pattern
					blue
				>
					<HBox fullSize gap_s padding_s>
						<Txt.Body>
							<Txt.Link onClick={() => props.realms.open(realm)}>
								<Txt.String>{realm.name}</Txt.String>
							</Txt.Link>
						</Txt.Body>
						<HSpacer grow/>
					</HBox>
				</DecoratedPanel>
			))}
		</>
	);
}

function SectionUnits(props: UseOutlinerWindow.Data): ReactElement {
	return (
		<>
			{props.units.entries.length > 0 && (
				<Txt.Header5>
					<Txt.String>Units</Txt.String>
				</Txt.Header5>
			)}
			{props.units.entries.map(worldObject => (
				<DecoratedPanel
					key={worldObject.id}
					pattern
					blue
				>
					<HBox fullSize gap_s padding_s>
						<Txt.Body>
							<Txt.Link onClick={() => props.units.open(worldObject)}>
								<Txt.String>{worldObject.type.group + "/" + worldObject.type.name}</Txt.String>
							</Txt.Link>
						</Txt.Body>
						<HSpacer grow/>
						<Button circle small onClick={() => props.units.focusCamera(worldObject)}>
							<Txt.Icon.Eye/>
						</Button>
					</HBox>
				</DecoratedPanel>
			))}
		</>
	);
}

function SectionTileImprovements(props: UseOutlinerWindow.Data): ReactElement {
	return (
		<>
			{props.tileImprovements.entries.length > 0 && (
				<Txt.Header5>
					<Txt.String>Tile Improvements</Txt.String>
				</Txt.Header5>
			)}
			{props.tileImprovements.entries.map(worldObject => (
				<DecoratedPanel
					key={worldObject.id}
					pattern
					blue
				>
					<HBox fullSize gap_s padding_s>
						<Txt.Body>
							<Txt.Link onClick={() => props.tileImprovements.open(worldObject)}>
								<Txt.String>{worldObject.type.group + "/" + worldObject.type.name}</Txt.String>
							</Txt.Link>
						</Txt.Body>
						<HSpacer grow/>
						<Button circle small onClick={() => props.tileImprovements.focusCamera(worldObject)}>
							<Txt.Icon.Eye/>
						</Button>
					</HBox>
				</DecoratedPanel>
			))}
		</>
	);
}