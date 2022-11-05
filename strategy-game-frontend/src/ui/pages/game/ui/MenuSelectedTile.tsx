import React, {ReactElement} from "react";
import {useCityAt} from "../../../../core/hooks/useCityAt";
import {useCityById} from "../../../../core/hooks/useCityById";
import {useCommandsAt} from "../../../../core/hooks/useCommandsAt";
import {useGameConfig} from "../../../../core/hooks/useGameConfig";
import {useSelectedTilePosition} from "../../../../core/hooks/useSelectedTilePosition";
import {useTileAt} from "../../../../core/hooks/useTileAt";
import {useValidateCreateBuilding} from "../../../../core/hooks/useValidateCreateBuilding";
import {useValidateCreateCity} from "../../../../core/hooks/useValidateCreateCity";
import {useValidateCreateTown} from "../../../../core/hooks/useValidateCreateTown";
import {useValidatePlaceScout} from "../../../../core/hooks/useValidatePlaceScout";
import {BuildingType} from "../../../../core/models/buildingType";
import {CommandCreateBuilding, CommandCreateCity} from "../../../../core/models/command";
import {Tile} from "../../../../core/models/tile";
import {AppConfig} from "../../../../main";
import {AdvButton} from "../../../components/specific/AdvButton";
import {ResourceLabel} from "../../../components/specific/ResourceLabel";
import {Section} from "../../../components/specific/Section";


export function MenuSelectedTile(): ReactElement {
    const selectedTilePos = useSelectedTilePosition();
    const selectedTile = useTileAt(selectedTilePos);
    return (
        <div>
            {selectedTile && (
                <>
                    <SectionTile tile={selectedTile}/>
                    <SectionCity tile={selectedTile}/>
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

function SectionCity(props: { tile: Tile }): ReactElement {
    const city = useCityAt(props.tile.position);
    const parentCity = useCityById(city?.parentCity);
    const config = useGameConfig();
    const buildingProduction = city?.isCity ? config.cityBuildingProductionPerTurn : config.townBuildingProductionPerTurn;
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
                <p>{"Region: " + (city.parentCity ? parentCity?.name : city.name)}</p>
                <p>{"Country: " + city.countryId}</p>
                <b>{"Buildings (" + city.buildings.length + "/" + (city.isCity ? config.cityBuildingSlots : config.townBuildingSlots) + ")"}</b>
                <AdvButton
                    label={"Add Lumber Camp"}
                    actionCosts={[{type: "wood", value: -config.buildingCostWood}, {type: "stone", value: -config.buildingCostStone}]}
                    turnCosts={[{type: "wood", value: buildingProduction}]}
                    disabled={!validateCreateBuilding(BuildingType.LUMBER_CAMP)}
                    onClick={() => createBuilding(BuildingType.LUMBER_CAMP)}
                />
                <AdvButton
                    label={"Add Quarry"}
                    actionCosts={[{type: "wood", value: -config.buildingCostWood}, {type: "stone", value: -config.buildingCostStone}]}
                    turnCosts={[{type: "stone", value: buildingProduction}]}
                    disabled={!validateCreateBuilding(BuildingType.QUARRY)}
                    onClick={() => createBuilding(BuildingType.QUARRY)}
                />
                <AdvButton
                    label={"Add Mine"}
                    actionCosts={[{type: "wood", value: -config.buildingCostWood}, {type: "stone", value: -config.buildingCostStone}]}
                    turnCosts={[{type: "metal", value: buildingProduction}]}
                    disabled={!validateCreateBuilding(BuildingType.MINE)}
                    onClick={() => createBuilding(BuildingType.MINE)}
                />
                <AdvButton
                    label={"Add Harbour"}
                    actionCosts={[{type: "wood", value: -config.buildingCostWood}, {type: "stone", value: -config.buildingCostStone}]}
                    turnCosts={[{type: "food", value: buildingProduction}]}
                    disabled={!validateCreateBuilding(BuildingType.HARBOR)}
                    onClick={() => createBuilding(BuildingType.HARBOR)}
                />
                <AdvButton
                    label={"Add Farm"}
                    actionCosts={[{type: "wood", value: -config.buildingCostWood}, {type: "stone", value: -config.buildingCostStone}]}
                    turnCosts={[{type: "food", value: buildingProduction}]}
                    disabled={!validateCreateBuilding(BuildingType.FARM)}
                    onClick={() => createBuilding(BuildingType.FARM)}
                />
                <ul>
                    {city.buildings.map(building => {
                        if (building.type === BuildingType.LUMBER_CAMP) {
                            return <li><b>Lumber Camp</b><ResourceLabel type={"wood"} value={buildingProduction} showPlusSign={true}/></li>;
                        }
                        if (building.type === BuildingType.QUARRY) {
                            return <li><b>Quarry</b><ResourceLabel type={"stone"} value={buildingProduction} showPlusSign={true}/></li>;
                        }
                        if (building.type === BuildingType.MINE) {
                            return <li><b>Mine</b><ResourceLabel type={"metal"} value={buildingProduction} showPlusSign={true}/></li>;
                        }
                        if (building.type === BuildingType.HARBOR) {
                            return <li><b>Harbor</b><ResourceLabel type={"food"} value={buildingProduction} showPlusSign={true}/></li>;
                        }
                        if (building.type === BuildingType.FARM) {
                            return <li><b>Farm</b><ResourceLabel type={"food"} value={buildingProduction} showPlusSign={true}/></li>;
                        }
                        return null;
                    })}
                </ul>
            </Section>
        );
    } else {
        return (
            <Section title="City">
                <AdvButton
                    label={"Create City"}
                    actionCosts={[{type: "money", value: -config.cityCostMoney}]}
                    turnCosts={[{type: "money", value: config.cityIncomePerTurn}, {type: "food", value: -config.cityFoodCostPerTurn}]}
                    disabled={!canCreateCity}
                    onClick={createCity}
                />
                <AdvButton
                    label={"Create Town"}
                    actionCosts={[{type: "money", value: -config.townCostMoney}]}
                    turnCosts={[{type: "food", value: -config.townFoodCostPerTurn}]}
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
