import React, {ReactElement} from "react";
import {CgShapeHexagon} from "react-icons/cg";
import {useCityAt} from "../../../../core/hooks/useCityAt";
import {useCityById} from "../../../../core/hooks/useCityById";
import {useCommandsAt} from "../../../../core/hooks/useCommandsAt";
import {useGameConfig} from "../../../../core/hooks/useGameConfig";
import {useProvinceAt} from "../../../../core/hooks/useProvinceAt";
import {useProvinceByCity} from "../../../../core/hooks/useProvinceByCity";
import {useSelectedTilePosition} from "../../../../core/hooks/useSelectedTilePosition";
import {useTileAt} from "../../../../core/hooks/useTileAt";
import {useValidateCreateBuilding} from "../../../../core/hooks/useValidateCreateBuilding";
import {useValidateCreateCity} from "../../../../core/hooks/useValidateCreateCity";
import {useValidateCreateTown} from "../../../../core/hooks/useValidateCreateTown";
import {useValidatePlaceScout} from "../../../../core/hooks/useValidatePlaceScout";
import {BuildingType} from "../../../../core/models/buildingType";
import {CommandCreateBuilding, CommandCreateCity} from "../../../../core/models/command";
import {ResourceType} from "../../../../core/models/resourceType";
import {Tile} from "../../../../core/models/tile";
import {AppConfig} from "../../../../main";
import {AdvButton} from "../../../components/specific/AdvButton";
import {ResourceLabel} from "../../../components/specific/ResourceLabel";
import {Section} from "../../../components/specific/Section";
import "./menuSelectedTile.css"

export function CategorySelectedTile(): ReactElement {
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    return (
        <div onClick={() => uiService.openToolbarMenuSelectedTile()}>
            <CgShapeHexagon/>
        </div>
    );
}

export function MenuSelectedTile(): ReactElement {
    const selectedTilePos = useSelectedTilePosition();
    const selectedTile = useTileAt(selectedTilePos);
    return (
        <div>
            {selectedTile && (
                <>
                    <SectionTile tile={selectedTile}/>
                    <SectionCity tile={selectedTile}/>
                    <SectionProvince tile={selectedTile}/>
                    <SectionCommands tile={selectedTile}/>
                    <SectionActions tile={selectedTile}/>
                </>
            )}

        </div>
    );
}


function SectionTile(props: { tile: Tile }): ReactElement {
    return (
        <Section title={"Tile"}>
            {props.tile && <p>{"Position: " + props.tile.position.q + ", " + props.tile.position.r}</p>}
            {props.tile && <p>{"Terrain: " + (props.tile.dataTier1 ? props.tile.dataTier1.terrainType : "?")}</p>}
            {props.tile && <p>{"Resource: " + (props.tile.dataTier1 ? props.tile.dataTier1.resourceType : "?")}</p>}
        </Section>
    );
}


function SectionProvince(props: { tile: Tile }): ReactElement {
    const province = useProvinceAt(props.tile.position);
    const city = useCityById(province?.provinceCapitalCityId);
    if (province && city) {
        return (
            <Section title={"Province"}>
                <p>{"Capital: " + city.name}</p>
                <p>{"Amount Cities: " + province.cityIds.length}</p>
                <p>Resources</p>
                <ul>
                    {ResourceType.ALL.map(resourceType => {
                        const amount = province.resources?.get(resourceType) || 0;
                        return (
                            <li><ResourceLabel type={resourceType} value={amount} showPlusSign={true}/></li>
                        );
                    })}
                </ul>
            </Section>
        );
    } else {
        return (<div/>);
    }
}


function SectionCity(props: { tile: Tile }): ReactElement {
    const city = useCityAt(props.tile.position);
    const province = useProvinceByCity(city?.cityId);
    const provinceCapital = useCityById(province?.provinceCapitalCityId);
    const config = useGameConfig();
    const canCreateCity = useValidateCreateCity(props.tile.position);
    const canCreateTown = useValidateCreateTown(props.tile.position);
    const validateCreateBuilding = useValidateCreateBuilding(city);
    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);

    function createCity() {
        uiService.openDialogCreateCity(props.tile.position);
    }

    function createTown() {
        uiService.openDialogCreateTown(props.tile.position);
    }

    function createBuilding(type: BuildingType) {
        if (city) {
            actionAddCommand.addCreateBuilding(city.cityId, type);
        }
    }

    if (city) {
        return (
            <Section title="City">
                <p>{"Name: " + city.name}</p>
                <p>{"Province: " + provinceCapital?.name}</p>
                <p>{"Country: " + city.countryId}</p>
                <b>{"Buildings (" + city.buildings.length + "/" + (city.isProvinceCapital ? config.cityBuildingSlots : config.townBuildingSlots) + ")"}</b>

                {BuildingType.ALL.map(buildingType => {
                    const displayName = BuildingType.toDisplayString(buildingType);
                    const consumes = BuildingType.consumes(buildingType);
                    const produces = BuildingType.produces(buildingType);
                    return (
                        <AdvButton
                            label={"Add " + displayName}
                            actionCosts={[]}
                            turnCosts={[
                                ...consumes.map(e => ({type: e.type, value: -e.amount})),
                                ...produces.map(e => ({type: e.type, value: e.amount}))
                            ]}
                            disabled={!validateCreateBuilding(buildingType)}
                            onClick={() => createBuilding(buildingType)}
                        />
                    );
                })}
                <ul>
                    {city.buildings.map(building => {
                        const active = building.active
                        const displayName = BuildingType.toDisplayString(building.type);
                        const consumes = BuildingType.consumes(building.type);
                        const produces = BuildingType.produces(building.type);
                        return (
                            <li className={active ? "" : "li-disabled"}>
                                <b>{displayName}</b>
                                {consumes.map(e => <ResourceLabel type={e.type} value={-e.amount} showPlusSign={true}/>)}
                                {produces.map(e => <ResourceLabel type={e.type} value={+e.amount} showPlusSign={true}/>)}
                            </li>
                        );
                    })}
                </ul>
            </Section>
        );
    } else {
        return (
            <Section title="City">
                <AdvButton
                    label={"Create City"}
                    actionCosts={[]}
                    turnCosts={[{type: ResourceType.FOOD, value: -config.cityFoodCostPerTurn}]}
                    disabled={!canCreateCity}
                    onClick={createCity}
                />
                <AdvButton
                    label={"Create Town"}
                    actionCosts={[]}
                    turnCosts={[{type: ResourceType.FOOD, value: -config.townFoodCostPerTurn}]}
                    disabled={!canCreateTown}
                    onClick={createTown}
                />
            </Section>
        );
    }
}

function SectionCommands(props: { tile: Tile }): ReactElement {
    const commands = useCommandsAt(props.tile.position);
    return (
        <Section title={"Local Commands"}>
            {commands.map(cmd => {
                if (cmd.commandType === "place-marker") {
                    return <div>Place Marker</div>;
                }
                if (cmd.commandType === "place-scout") {
                    return <div>Place Scout</div>;
                }
                if (cmd.commandType === "create-city") {
                    return <div>{"Create City '" + (cmd as CommandCreateCity).name + "'"}</div>;
                }
                if (cmd.commandType === "create-building") {
                    return <div>{"Create Building '" + (cmd as CommandCreateBuilding).buildingType + "'"}</div>;
                }
            })}
        </Section>
    );
}

function SectionActions(props: { tile: Tile }): ReactElement {

    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);
    const canPlaceScout = useValidatePlaceScout(props.tile.position);

    function placeScout() {
        actionAddCommand.addPlaceScout(props.tile.position);
    }

    function placeMarker() {
        actionAddCommand.addPlaceMarker(props.tile.position);
    }

    return (
        <Section title={"Actions"}>
            <AdvButton
                label={"Send Scout"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={!canPlaceScout}
                onClick={() => placeScout()}
            />
            <AdvButton
                label={"Place Marker"}
                actionCosts={[]}
                turnCosts={[]}
                disabled={false}
                onClick={() => placeMarker()}
            />
        </Section>
    );
}
