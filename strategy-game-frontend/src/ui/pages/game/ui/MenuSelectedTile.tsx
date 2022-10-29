import React, {ReactElement} from "react";
import {useCityAt} from "../../../../core/hooks/useCityAt";
import {useCommandsAt} from "../../../../core/hooks/useCommandsAt";
import {useSelectedTilePosition} from "../../../../core/hooks/useSelectedTilePosition";
import {useTileAt} from "../../../../core/hooks/useTileAt";
import {useValidateCreateBuilding} from "../../../../core/hooks/useValidateCreateBuilding";
import {useValidateCreateCity} from "../../../../core/hooks/useValidateCreateCity";
import {useValidateCreateTown} from "../../../../core/hooks/useValidateCreateTown";
import {useValidatePlaceScout} from "../../../../core/hooks/useValidatePlaceScout";
import {AppConfig} from "../../../../main";
import {BuildingType} from "../../../../core/models/buildingType";
import {CommandCreateCity} from "../../../../core/models/command";
import {TilePosition} from "../../../../core/models/tilePosition";


export function MenuSelectedTile(): ReactElement {
    const selectedTile = useSelectedTilePosition();
    return (
        <div>
            <h3>Selected Tile</h3>
            <SectionTile selectedTile={selectedTile}/>
            <SectionInfluences selectedTile={selectedTile}/>
            <SectionOwner selectedTile={selectedTile}/>
            <SectionCity selectedTile={selectedTile}/>
            <SectionMarkers selectedTile={selectedTile}/>
            <SectionScouts selectedTile={selectedTile}/>
            <SectionCommands selectedTile={selectedTile}/>
        </div>
    );
}


function SectionTile(props: { selectedTile: TilePosition | null }): ReactElement {
    const tile = useTileAt(props.selectedTile);
    return (
        <ul>
            {tile && <li>{"q: " + tile.position.q}</li>}
            {tile && <li>{"r: " + tile.position.r}</li>}
            {tile && <li>{"terrain: " + (tile.dataTier1 ? tile.dataTier1.terrainType : "?")}</li>}
            {tile && <li>{"resource: " + (tile.dataTier1 ? tile.dataTier1.resourceType : "?")}</li>}
            {!tile && <li>no tile selected</li>}
        </ul>
    );
}


function SectionInfluences(props: { selectedTile: TilePosition | null }): ReactElement | null {
    const tile = useTileAt(props.selectedTile);
    if (props.selectedTile && tile) {
        return (
            <>
                <h3>Influences</h3>
                {tile.dataTier2 && (
                    <ul>
                        {
                            tile.dataTier2.influences.map(influence => (
                                <>
                                    <li>{influence.countryId + "." + influence.cityId + " = " + influence.amount}</li>
                                </>
                            ))
                        }
                    </ul>
                )}
                {(tile.dataTier2 === null || tile.dataTier2 === undefined) && (
                    <div>Not Visible</div>
                )}
            </>
        );
    } else {
        return null;
    }
}


function SectionOwner(props: { selectedTile: TilePosition | null }): ReactElement | null {
    const tile = useTileAt(props.selectedTile);
    if (tile) {
        if (tile.dataTier1) {
            if (tile.dataTier1.owner) {
                return (
                    <>
                        <h3>Owner</h3>
                        <ul>
                            <li>{"Country = " + tile.dataTier1.owner?.countryId}</li>
                            <li>{"City = " + tile.dataTier1.owner?.cityId}</li>
                        </ul>
                    </>
                );
            } else {
                return null;
            }
        } else {
            return (
                <>
                    <h3>Owner</h3>
                    <div>Not Visible</div>
                </>
            );
        }
    } else {
        return null;
    }
}


function SectionCity(props: { selectedTile: TilePosition | null }): ReactElement | null {
    const city = useCityAt(props.selectedTile);
    const canCreateCity = useValidateCreateCity(props.selectedTile);
    const canCreateTown = useValidateCreateTown(props.selectedTile);
    const validateCreateBuilding = useValidateCreateBuilding(city)
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);
    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);


    function createCity() {
        if (props.selectedTile) {
            uiService.openDialogCreateCity(props.selectedTile);
        }
    }

    function createTown() {
        if (props.selectedTile) {
            uiService.openDialogCreateTown(props.selectedTile);
        }
    }

    function createBuilding(type: BuildingType) {
        if (city) {
            actionAddCommand.addCreateBuilding(city.cityId, type);
        }
    }

    if (props.selectedTile) {
        return (
            <>
                <h3>City</h3>
                <button disabled={!canCreateCity} onClick={createCity}>Create City</button>
                <button disabled={!canCreateTown} onClick={createTown}>Create Town</button>
                {city && (
                    <ul>
                        <li>{"name: " + city.name}</li>
                        <li>{"country: " + city.countryId}</li>
                        <li>
                            <b>Buildings</b>
                            <ul>
                                <li>
                                    {city.buildings.filter(b => b.type === BuildingType.LUMBER_CAMP).length + "x"}
                                    <button disabled={!validateCreateBuilding(BuildingType.LUMBER_CAMP)}
                                            onClick={() => createBuilding(BuildingType.LUMBER_CAMP)}>
                                        Lumber Camp
                                    </button>
                                </li>
                                <li>
                                    {city.buildings.filter(b => b.type === BuildingType.MINE).length + "x"}
                                    <button disabled={!validateCreateBuilding(BuildingType.MINE)}
                                            onClick={() => createBuilding(BuildingType.MINE)}>
                                        Mine
                                    </button>
                                </li>
                                <li>
                                    {city.buildings.filter(b => b.type === BuildingType.QUARRY).length + "x"}
                                    <button disabled={!validateCreateBuilding(BuildingType.QUARRY)}
                                            onClick={() => createBuilding(BuildingType.QUARRY)}>
                                        Quarry
                                    </button>
                                </li>
                                <li>
                                    {city.buildings.filter(b => b.type === BuildingType.HARBOR).length + "x"}
                                    <button disabled={!validateCreateBuilding(BuildingType.HARBOR)}
                                            onClick={() => createBuilding(BuildingType.HARBOR)}>
                                        Harbor
                                    </button>
                                </li>
                                <li>
                                    {city.buildings.filter(b => b.type === BuildingType.FARM).length + "x"}
                                    <button disabled={!validateCreateBuilding(BuildingType.FARM)}
                                            onClick={() => createBuilding(BuildingType.FARM)}>
                                        Farm
                                    </button>
                                </li>
                            </ul>
                        </li>
                    </ul>
                )}
            </>
        );
    } else {
        return null;
    }
}


function SectionMarkers(props: { selectedTile: TilePosition | null }): ReactElement | null {

    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);

    function placeMarker() {
        if (props.selectedTile) {
            actionAddCommand.addPlaceMarker(props.selectedTile);
        }
    }

    if (props.selectedTile) {
        return (
            <>
                <h3>Marker</h3>
                <button onClick={placeMarker}>Place Marker</button>
            </>
        );
    } else {
        return null;
    }
}


function SectionScouts(props: { selectedTile: TilePosition | null }): ReactElement | null {

    const actionAddCommand = AppConfig.di.get(AppConfig.DIQ.TurnAddCommandAction);
    const canPlaceScout = useValidatePlaceScout(props.selectedTile);

    function placeScout() {
        if (props.selectedTile) {
            actionAddCommand.addPlaceScout(props.selectedTile);
        }
    }

    if (props.selectedTile) {
        return (
            <>
                <h3>Scout</h3>
                <button disabled={!canPlaceScout} onClick={placeScout}>Place Scout</button>
            </>
        );
    } else {
        return null;
    }
}

function SectionCommands(props: { selectedTile: TilePosition | null }): ReactElement | null {
    const commands = useCommandsAt(props.selectedTile);
    if (props.selectedTile) {
        return (
            <>
                <h3>Commands</h3>
                <ul>
                    {commands.map(cmd => {
                        if (cmd.commandType === "place-marker") {
                            return <li>Place Marker</li>;
                        }
                        if (cmd.commandType === "place-scout") {
                            return <li>Place Scout</li>;
                        }
                        if (cmd.commandType === "create-city") {
                            return <li>{"Create City '" + (cmd as CommandCreateCity).name + "'"}</li>;
                        }
                        return <li>?</li>;
                    })}
                </ul>
            </>
        );
    } else {
        return null;
    }
}

