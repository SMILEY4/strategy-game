import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Txt} from "../../../../components/text/Txt";
import {CountryId} from "../../../../../models/country/countryId";
import {UseCountryWindow} from "./useCountryWindow";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {Divider} from "../../../../components/divider/Divider";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {VSpacer} from "../../../../components/spacer/Spacer";

export interface CountryWindowProps {
	windowId: string;
	identifier: CountryId | null;
}

export function CountryWindow(props: CountryWindowProps): ReactElement {

	const data: UseCountryWindow.Data | null = UseCountryWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
				<Txt.Body secondary center fullSize>
					<Txt.String>No country selected.</Txt.String>
				</Txt.Body>
			</DecoratedWindow>
		);

	} else {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton noPadding>
				<VBox fullSize>

					<Banner
						title={data.country.name}
						subtitle={"Country"}
						color={data.country.color}
						spaceAbove
					/>

					<VBox padding_l gap_m scrollable grow shrink>

						<Txt.Header2 center>
							<Txt.String>Overview</Txt.String>
						</Txt.Header2>
						<Divider line/>

						<SectionBaseInformation {...data}/>
						<VSpacer size_s/>

						<Txt.Header2 center>
							<Txt.String>Settlements</Txt.String>
						</Txt.Header2>
						<Divider line/>

						<SectionSettlements {...data}/>
						<VSpacer size_s/>

						<Txt.Header2 center>
							<Txt.String>Units</Txt.String>
						</Txt.Header2>
						<Divider line/>

						<SectionUnits {...data}/>

					</VBox>

				</VBox>
			</DecoratedWindow>
		);
	}

}


function SectionBaseInformation(props: UseCountryWindow.Data): ReactElement {
	return (
		<InsetKeyValueGrid dontGrow dontShrink>

			<Txt.Body><Txt.String>Name:</Txt.String></Txt.Body>
			<Txt.Body><Txt.String>{props.country.name}</Txt.String></Txt.Body>

			<Txt.Body><Txt.String>Player:</Txt.String></Txt.Body>
			<Txt.Body><Txt.String>{props.country.player.name}</Txt.String></Txt.Body>

		</InsetKeyValueGrid>
	);
}

function SectionSettlements(props: UseCountryWindow.Data): ReactElement {
	return (
		<InsetPanel dontShrink dontGrow>
			<VBox padding_s gap_s fullSize>

				{props.country.settlements.length === 0 && (
					<Txt.Body center secondary>
						<Txt.String>No settlements.</Txt.String>
					</Txt.Body>
				)}

				{props.country.settlements.map(settlement => (
					<DecoratedPanel
						key={settlement.id}
						pattern
						blue
					>
						<HBox fullSize padding_s gap_s>
							<Txt.Body>
								<Txt.Link onClick={() => props.open.settlement(settlement)}>
									<Txt.String>{settlement.name}</Txt.String>
								</Txt.Link>
							</Txt.Body>
						</HBox>
					</DecoratedPanel>
				))}

			</VBox>
		</InsetPanel>
	);
}

function SectionUnits(props: UseCountryWindow.Data): ReactElement {
	return (
		<InsetPanel dontShrink dontGrow>
			<VBox padding_s gap_s fullSize>

				{props.country.worldObjects.length === 0 && (
					<Txt.Body center secondary>
						<Txt.String>No units.</Txt.String>
					</Txt.Body>
				)}

				{props.country.worldObjects.map(worldObject => (
					<DecoratedPanel
						key={worldObject.id}
						pattern
						blue
					>
						<HBox fullSize padding_s gap_s>
							<Txt.Body>
								<Txt.Link onClick={() => props.open.worldObject(worldObject)}>
									<Txt.String>{worldObject.type.id}</Txt.String>
								</Txt.Link>
							</Txt.Body>
						</HBox>
					</DecoratedPanel>
				))}

			</VBox>
		</InsetPanel>
	);
}