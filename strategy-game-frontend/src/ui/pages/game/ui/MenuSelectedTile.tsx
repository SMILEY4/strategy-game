import React, {ReactElement} from "react";
import {useCityAt} from "../../../../core/hooks/useCityAt";
import {useCommandsAt} from "../../../../core/hooks/useCommandsAt";
import {useSelectedTilePosition} from "../../../../core/hooks/useSelectedTilePosition";
import {useTileAt} from "../../../../core/hooks/useTileAt";
import {useValidateCreateCity} from "../../../../core/hooks/useValidateCreateCity";
import {useValidateCreateTown} from "../../../../core/hooks/useValidateCreateTown";
import {useValidatePlaceScout} from "../../../../core/hooks/useValidatePlaceScout";
import {AppConfig} from "../../../../main";
import {CommandCreateCity} from "../../../../models/state/command";
import {TilePosition} from "../../../../models/state/tilePosition";


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
    return (
        <ul>
            {props.selectedTile && <li>{"q: " + props.selectedTile.q}</li>}
            {props.selectedTile && <li>{"r: " + props.selectedTile.r}</li>}
            {!props.selectedTile && <li>no tile selected</li>}
        </ul>
    );
}


function SectionInfluences(props: { selectedTile: TilePosition | null }): ReactElement | null {
    const tile = useTileAt(props.selectedTile);
    if (props.selectedTile && tile) {
        return (
            <>
                <h3>Influences</h3>
                {tile.advancedData && (
                    <ul>
                        {
                            tile.advancedData.influences.map(influence => (
                                <>
                                    <li>{influence.countryId + "." + influence.cityId + " = " + influence.amount}</li>
                                </>
                            ))
                        }
                    </ul>
                )}
                {(tile.advancedData === null || tile.advancedData === undefined) && (
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
        if (tile.generalData) {
            if (tile.generalData.owner) {
                return (
                    <>
                        <h3>Owner</h3>
                        <ul>
                            <li>{"Country = " + tile.generalData.owner?.countryId}</li>
                            <li>{"City = " + tile.generalData.owner?.cityId}</li>
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
    const uiService = AppConfig.di.get(AppConfig.DIQ.UIService);

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

    if (props.selectedTile) {
        return (
            <>
                <h3>City</h3>
                {city && (
                    <ul>
                        <li>{"name: " + city.name}</li>
                        <li>{"country: " + city.countryId}</li>
                    </ul>
                )}
                <button disabled={!canCreateCity} onClick={createCity}>Create City</button>
                <button disabled={!canCreateTown} onClick={createTown}>Create Town</button>
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

