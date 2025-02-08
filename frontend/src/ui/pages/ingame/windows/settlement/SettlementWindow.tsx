import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {UseSettlementWindow} from "./useSettlementWindow";
import {VSpacer} from "../../../../components/spacer/Spacer";
import {InsetPanel} from "../../../../components/panels/inset/InsetPanel";
import {HBox} from "../../../../components/layout/hbox/HBox";
import {Button} from "../../../../components/button/Button";
import "./settlementWindow.less";
import {DecoratedWindow} from "../../../../components/window/decorated/DecoratedWindow";
import {Banner} from "../../../../components/banner/Banner";
import {Divider} from "../../../../components/divider/Divider";
import {InsetKeyValueGrid} from "../../../../components/keyvalue/KeyValueGrid";
import {Color} from "../../../../../models/base/color";
import {ResourceLedgerBox} from "./ResourceLedgerBox";
import {BuildingBox} from "./BuildingBox";
import {ProgressBar} from "../../../../components/progressBar/ProgressBar";
import {CSS_COLOR_SUCCESS_LIGHT, CSS_COLOR_WARN_LIGHT} from "../../../../components/commonColors";
import {ProgressCircle} from "./ProgressCircle";
import {TabBar, TabOption} from "../../../../components/tab/TabBar";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Txt} from "../../../../components/text/Txt";

export interface SettlementWindowProps {
	windowId: string;
	identifier: string | null;
}

export function SettlementWindow(props: SettlementWindowProps): ReactElement {

	const data: UseSettlementWindow.Data | null = UseSettlementWindow.useData(props.identifier);

	if (data === null) {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton withPinButton>
				<Txt.Body center fullSize>
					<Txt.String>No settlement selected</Txt.String>
				</Txt.Body>
			</DecoratedWindow>
		);
	} else {
		return (
			<DecoratedWindow windowId={props.windowId} withCloseButton noPadding withPinButton>
				<VBox fullSize>

					<Banner
						title={data.settlement.identifier.name}
						subtitle={"Settlement"}
						color={data.settlement.country.color}
						spaceAbove
					>
						<Button circle small onClick={data.open.tile}><Txt.Icon.Tile/></Button>
						<Button circle small onClick={data.centerCamera}><Txt.Icon.Eye/></Button>
					</Banner>

					<TabBar initial="Overview">

						<TabOption name="Overview">
							<VBox grow shrink scrollable padding_s gap_m>
								<PanelOverview {...data}/>
							</VBox>
						</TabOption>

						<TabOption name="Industry">
							<VBox grow shrink scrollable padding_s gap_m>
								<PanelIndustry {...data}/>
							</VBox>
						</TabOption>

						<TabOption name="Population">
							<VBox grow shrink scrollable padding_s gap_m>
								<PanelPopulation {...data}/>
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


function PanelOverview(props: UseSettlementWindow.Data): ReactElement {
	return (
		<>
			<SectionBaseInfo {...props}/>
			<SectionRoutes {...props}/>
		</>
	);
}

function PanelIndustry(props: UseSettlementWindow.Data): ReactElement {
	return (
		<>
			<SectionProduction {...props}/>
			<SectionResourceBalance {...props}/>
			<SectionBuildings {...props}/>
		</>
	);
}

function PanelPopulation(props: UseSettlementWindow.Data): ReactElement {
	return (
		<>
			<SectionPopulationSize {...props}/>
			<SectionGrowthOverview {...props}/>
		</>
	);
}

function PanelDebug(props: UseSettlementWindow.Data): ReactElement {
	return (
		<>
			<InsetKeyValueGrid dontShrink dontGrow>

				<Txt.Body><Txt.String>Settlement Id:</Txt.String></Txt.Body>
				<Txt.Body><Txt.String>{props.settlement.identifier.id}</Txt.String></Txt.Body>

				<Txt.Body><Txt.String>Country Id:</Txt.String></Txt.Body>
				<Txt.Body><Txt.String>{props.settlement.country.id}</Txt.String></Txt.Body>

				<Txt.Body><Txt.String>Tile:</Txt.String></Txt.Body>
				<Txt.Body><Txt.String>{props.settlement.tile.q + ", " + props.settlement.tile.r}</Txt.String></Txt.Body>

			</InsetKeyValueGrid>
		</>
	);
}


function SectionBaseInfo(props: UseSettlementWindow.Data): ReactElement {
	return (
		<InsetKeyValueGrid dontGrow dontShrink>

            <Txt.Body><Txt.String>Name:</Txt.String></Txt.Body>
            <Txt.Body><Txt.String>{props.settlement.identifier.name}</Txt.String></Txt.Body>

            <Txt.Body><Txt.String>Country:</Txt.String></Txt.Body>
            <Txt.Body><Txt.String>{props.settlement.country.name}</Txt.String></Txt.Body>

            <Txt.Body><Txt.String>Population:</Txt.String></Txt.Body>
            <Txt.Body><Txt.Number behaviour="neutral" signBehaviour="never">{props.settlement.population.size}</Txt.Number></Txt.Body>

		</InsetKeyValueGrid>
	);
}

function SectionRoutes(props: UseSettlementWindow.Data): ReactElement {
	return (
		<VBox gap_s dontGrow dontShrink>

			<VSpacer size_s/>
			<Txt.Header2 center>
				<Txt.String>Connections</Txt.String>
			</Txt.Header2>
			<Divider line/>

			<InsetPanel dontShrink dontGrow>
				<VBox padding_s gap_s fullSize>

					{props.settlement.routes.length === 0 && (
						<Txt.Body center secondary>
							<Txt.String>No connected settlements.</Txt.String>
						</Txt.Body>
					)}

					{props.settlement.routes.map(route => (
						<DecoratedPanel
							key={route.id}
							pattern
							blue
							background={<DecoratedPanel.ColorBackground
								color={Color.toCss(route.targetCountry.color)}/>}
						>
							<HBox fullSize padding_s gap_s>
								<Txt.Body>
									<Txt.String>to</Txt.String>
									<Txt.Whitespace/>
									<Txt.Link onClick={() => props.open.settlement(route.targetSettlement.id)}>
										<Txt.String>{route.targetSettlement.name}</Txt.String>
									</Txt.Link>
								</Txt.Body>
							</HBox>
						</DecoratedPanel>
					))}

				</VBox>
			</InsetPanel>
		</VBox>
	);
}

function SectionResourceBalance(props: UseSettlementWindow.Data) {
	return (
		<VBox gap_s dontGrow dontShrink>

			<VSpacer size_s/>
			<Txt.Header2 center>
				<Txt.String>Resource Balance</Txt.String>
			</Txt.Header2>
			<Divider line/>

			<InsetPanel dontShrink dontGrow>
				<HBox padding_s gap_s left wrap fullSize>
					{!props.settlement.resources.visible && (
						<Txt.Body grow secondary>
							<Txt.String>Unknown</Txt.String>
						</Txt.Body>
					)}
					{(props.settlement.resources.visible && props.settlement.resources.value.length == 0) && (
						<Txt.Body grow secondary>
							<Txt.String>No resources.</Txt.String>
						</Txt.Body>
					)}
					{(props.settlement.resources.visible && props.settlement.resources.value.length > 0) && props.settlement.resources.value.map(entry => (
						<ResourceLedgerBox {...entry} key={entry.type}/>
					))}
				</HBox>
			</InsetPanel>
		</VBox>
	);
}

function SectionBuildings(props: UseSettlementWindow.Data) {
	return (
		<VBox gap_s dontGrow dontShrink>

			<VSpacer size_s/>
			<Txt.Header2 center>
				<Txt.String>Buildings</Txt.String>
			</Txt.Header2>
			<Divider line/>

			<InsetPanel dontShrink dontGrow>
				<HBox padding_s gap_s left wrap fullSize>
					{!props.settlement.buildings.visible && (
						<Txt.Body grow secondary center>
							<Txt.String>Unknown.</Txt.String>
						</Txt.Body>
					)}
					{(props.settlement.buildings.visible && props.settlement.buildings.value.length == 0) && (
						<Txt.Body grow secondary center>
							<Txt.String>No buildings constructed.</Txt.String>
						</Txt.Body>
					)}
					{(props.settlement.buildings.visible && props.settlement.buildings.value.length > 0) && props.settlement.buildings.value.map((entry, i) => (
						<BuildingBox building={entry} key={i}/>
					))}
				</HBox>
			</InsetPanel>
		</VBox>
	);
}

function SectionProduction(props: UseSettlementWindow.Data): ReactElement {
	return (
		<VBox gap_s dontGrow dontShrink>

			<VSpacer size_s/>
			<Txt.Header2 center>
				<Txt.String>Production</Txt.String>
			</Txt.Header2>
			<Divider line/>

			{!props.settlement.production.queue.visible && (
				<Txt.Body secondary center>
					<Txt.String>Unknown</Txt.String>
				</Txt.Body>
			)}

			{props.settlement.production.queue.visible && (

				<HBox dontShrink dontGrow centerVertical left gap_s>

					{props.settlement.country.isUserCountry && (
						<Button square onClick={props.productionQueue.add}><Txt.Icon.Plus/></Button>
					)}

					<ProgressBar
						grow
						shrink
						progress={props.productionQueue.activeEntry === null ? 0 : props.productionQueue.activeEntry.progress}
						onClick={props.productionQueue.open}
						className="production_queue__progress"
					>
						<Txt.Body>
							<Txt.String>{props.productionQueue.activeEntry === null ? "" : props.productionQueue.activeEntry.type}</Txt.String>
						</Txt.Body>
					</ProgressBar>

					{props.settlement.country.isUserCountry && (
						<Button square circle small onClick={props.productionQueue.cancel}><Txt.Icon.Close/></Button>
					)}

				</HBox>

			)}

		</VBox>
	);
}

function SectionPopulationSize(props: UseSettlementWindow.Data): ReactElement {
	return (
		<InsetKeyValueGrid dontGrow dontShrink>

            <Txt.Body><Txt.String>Population Size:</Txt.String></Txt.Body>
            <Txt.Body><Txt.Number behaviour="neutral" signBehaviour="never">{props.settlement.population.size}</Txt.Number></Txt.Body>

		</InsetKeyValueGrid>
	);
}


function SectionGrowthOverview(props: UseSettlementWindow.Data): ReactElement {
	const totalProgress = props.settlement.population.growth.value?.progress ?? 0;
	const lastProgress = props.settlement.population.growth.value?.amount ?? 0;
	const expectedPopulationChange = totalProgress >= 0 ? +1 : -1;

	return (
		<VBox gap_s dontGrow dontShrink>

			<VSpacer size_s/>

			<Txt.Header2 center>
				<Txt.String>Growth</Txt.String>
			</Txt.Header2>

			<Divider line/>

			{!props.settlement.population.growth.visible && (
				<Txt.Body secondary center>
					<Txt.String>Unknown</Txt.String>
				</Txt.Body>
			)}

			{props.settlement.population.growth.visible && (
				<>
					<HBox gap_s stretch centerVertical>
						<ProgressCircle totalProgress={totalProgress} currentChange={lastProgress}/>
						<InsetPanel grow shrink>
							<VBox padding_s gap_xs left centerVertical fullSize>
								<Txt.Body>
									<Txt.Percentage
										behaviour="more-is-better"
										signBehaviour="minus-only"
										zeroClassification="negative"
									>
										{totalProgress}
									</Txt.Percentage>
									<Txt.Whitespace/>
									<Txt.String>total progress for</Txt.String>
									<Txt.Whitespace/>
									<Txt.Number
										behaviour="more-is-better"
										signBehaviour="always"
										zeroClassification="negative"
									>
										{expectedPopulationChange}
									</Txt.Number>
									<Txt.Whitespace/>
									<Txt.String>population.</Txt.String>
								</Txt.Body>
								<Txt.Body>
									<Txt.Percentage
										behaviour="more-is-better"
										signBehaviour="always"
										zeroClassification="negative"
									>
										{lastProgress}
									</Txt.Percentage>
									<Txt.Whitespace/>
									<Txt.String>growth since last turn.</Txt.String>
								</Txt.Body>
							</VBox>
						</InsetPanel>
					</HBox>

					<InsetPanel dontShrink dontGrow>
						<VBox padding_s gap_s fullSize>
							{props.settlement.population.growth.value.details.map(detail => (
								<DecoratedPanel
									key={detail.key + "" + detail.amount}
									blue
									pattern
									background={
										<DecoratedPanel.ColorBackground
											color={detail.amount > 0 ? CSS_COLOR_SUCCESS_LIGHT : CSS_COLOR_WARN_LIGHT}
										/>
									}
								>
									<HBox padding_s>
										<Txt.Body>
											<Txt.Percentage
												behaviour="more-is-better"
												signBehaviour="always"
												zeroClassification="negative"
											>
												{detail.amount}
											</Txt.Percentage>
											<Txt.Whitespace/>
											<Txt.String>{detail.key}</Txt.String>
										</Txt.Body>
									</HBox>
								</DecoratedPanel>
							))}
						</VBox>
					</InsetPanel>
				</>
			)}
		</VBox>
	);
}