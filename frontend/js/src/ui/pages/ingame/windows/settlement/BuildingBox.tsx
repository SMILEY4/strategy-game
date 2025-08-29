import "./buildingBox.less";
import React, {ReactElement} from "react";
import {VBox} from "../../../../components/layout/vbox/VBox";
import {If, Then} from "react-if";
import {Divider} from "../../../../components/divider/Divider";
import {DecoratedPanel} from "../../../../components/panels/decorated/DecoratedPanel";
import {Tooltip} from "../../../../components/tooltip/Tooltip";
import {Txt} from "../../../../components/text/Txt";
import {SettlementBuilding} from "../../../../../models/settlement/settlement";

export function BuildingBox(props: { building: SettlementBuilding }): ReactElement {
	return (
		<Tooltip.Context>
			<Tooltip.Trigger>
				<Box building={props.building}/>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<Details building={props.building}/>
			</Tooltip.Content>
		</Tooltip.Context>
	);
}


function Box(props: { building: SettlementBuilding }): ReactElement {
	const active = (props.building.validity.workTile && props.building.validity.inputResources);
	return (
		<DecoratedPanel
			className={"building-box"}
			blue
			pattern
			background={
				<DecoratedPanel.ImageBackground
					url={"icons/production/" + props.building.type + ".png"}
					desaturated={!active}
				/>
			}
		/>
	);
}

function Details(props: { building: SettlementBuilding }): ReactElement {
	return (
		<VBox padding_s gap_s>

			<Txt.Header4>
				<Txt.String>{props.building.type}</Txt.String>
			</Txt.Header4>

			<Divider line/>

			<If condition={props.building.activity.consumed.length > 0}>
				<Then>
					{props.building.activity.consumed.map(entry => (
                        <Txt.Body key={entry.type}>
                            <Txt.Number behaviour="more-is-better" signBehaviour="always">{-entry.amount}</Txt.Number>
                            <Txt.Whitespace/>
                            <Txt.Icon name={entry.type.toLowerCase()}/>
                            <Txt.Whitespace/>
                            <Txt.String>{entry.type}</Txt.String>
                        </Txt.Body>
					))}
				</Then>
			</If>

			<If condition={props.building.activity.produced.length > 0}>
				<Then>
					{props.building.activity.produced.map(entry => (
                        <Txt.Body key={entry.type}>
                            <Txt.Number behaviour="more-is-better" signBehaviour="always">{entry.amount}</Txt.Number>
                            <Txt.Whitespace/>
                            <Txt.Icon name={entry.type.toLowerCase()}/>
                            <Txt.Whitespace/>
                            <Txt.String>{entry.type}</Txt.String>
                        </Txt.Body>
					))}
				</Then>
			</If>


			<If condition={props.building.activity.missing.length > 0 || !props.building.validity.workTile}>
				<Then>
                    <Txt.Body>
                        <Txt.String>Missing:</Txt.String>
                    </Txt.Body>

					{!props.building.validity.workTile && (
                        <Txt.Body>
                            <Txt.String negative>
                                {"Tile to work on: " + props.building.workTile.requiredTerrain?.id + " " + props.building.workTile.requiredResource?.id}
                            </Txt.String>
                        </Txt.Body>
					)}
					{props.building.activity.missing.map(entry => (
                        <Txt.Body key={entry.type}>
                            <Txt.Number behaviour="less-is-better" signBehaviour="never">{entry.amount}</Txt.Number>
                            <Txt.Whitespace/>
                            <Txt.Icon name={entry.type.toLowerCase()}/>
                            <Txt.Whitespace/>
                            <Txt.String>{entry.type}</Txt.String>
                        </Txt.Body>
					))}
				</Then>
			</If>

		</VBox>
	);
}