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
								<SectionCountries {...data}/>
								<SectionSettlements {...data}/>
								<SectionWorldObjects {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

					<TabOption name="Countries">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionCountries {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

					<TabOption name="Settlements">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionSettlements {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

					<TabOption name="Units">
						<InsetPanel shrink>
							<VBox scrollable padding_s gap_s fullSize>
								<SectionWorldObjects {...data}/>
							</VBox>
						</InsetPanel>
					</TabOption>

				</TabBar>


			</VBox>
		</DecoratedWindow>
	);
}

function SectionCountries(props: UseOutlinerWindow.Data): ReactElement {
	return (
		<>
			{props.countries.entries.length > 0 && (
				<Txt.Header5>
					<Txt.String>Countries</Txt.String>
				</Txt.Header5>
			)}
			{props.countries.entries.map(country => (
				<DecoratedPanel
					key={country.id}
					pattern
					blue
				>
					<HBox fullSize gap_s padding_s>
						<Txt.Body>
							<Txt.String>{country.name}</Txt.String>
						</Txt.Body>
						<HSpacer grow/>
					</HBox>
				</DecoratedPanel>
			))}
		</>
	);
}

function SectionSettlements(props: UseOutlinerWindow.Data): ReactElement {
	return (
		<>
			{props.settlements.entries.length > 0 && (
				<Txt.Header5>
					<Txt.String>Settlements</Txt.String>
				</Txt.Header5>
			)}
			{props.settlements.entries.map(settlement => (
				<DecoratedPanel
					key={settlement.id}
					pattern
					blue
				>
					<HBox fullSize gap_s padding_s>
						<Txt.Body>
							<Txt.Link onClick={() => props.settlements.open(settlement)}>
								<Txt.String>{settlement.name}</Txt.String>
							</Txt.Link>
						</Txt.Body>
						<HSpacer grow/>
						<Button circle small onClick={() => props.settlements.focusCamera(settlement)}>
							<Txt.Icon.Eye/>
						</Button>
					</HBox>
				</DecoratedPanel>
			))}
		</>
	);
}

function SectionWorldObjects(props: UseOutlinerWindow.Data): ReactElement {
	return (
		<>
			{props.worldObjects.entries.length > 0 && (
				<Txt.Header5>
					<Txt.String>Units</Txt.String>
				</Txt.Header5>
			)}
			{props.worldObjects.entries.map(worldObject => (
				<DecoratedPanel
					key={worldObject.id}
					pattern
					blue
				>
					<HBox fullSize gap_s padding_s>
						<Txt.Body>
							<Txt.Link onClick={() => props.worldObjects.open(worldObject)}>
								<Txt.String>{worldObject.type.id}</Txt.String>
							</Txt.Link>
						</Txt.Body>
						<HSpacer grow/>
						<Button circle small onClick={() => props.worldObjects.focusCamera(worldObject)}>
							<Txt.Icon.Eye/>
						</Button>
					</HBox>
				</DecoratedPanel>
			))}
		</>
	);
}