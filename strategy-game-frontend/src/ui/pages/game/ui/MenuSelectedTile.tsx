import React, {ReactElement, useState} from "react";
import {GameHooks} from "../../../../core/actions/GameHooks";
import {GameStateHooks} from "../../../../external/state/game/gameStateHooks";
import {LocalGameStateHooks} from "../../../../external/state/localgame/localGameStateHooks";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";
import {AppConfig} from "../../../../main";
import {CommandCreateCity} from "../../../../models/state/command";
import {TilePosition} from "../../../../models/state/tilePosition";
import {TextField} from "../../../components/specific/TextField";
import useTileAt = GameStateHooks.useTileAt;


export function MenuSelectedTile(): ReactElement {
    const selectedTile = LocalGameStateHooks.useSelectedTilePosition();
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
    const tile = GameStateHooks.useTileAt(props.selectedTile ? props.selectedTile.q : 9999999, props.selectedTile ? props.selectedTile.r : 999999);
    if (props.selectedTile && tile) {
        return (
            <>
                <h3>Influences</h3>
                {tile.advancedData && (
                    <ul>
                        {
                            tile.advancedData.influences.map(influence => (
                                <>
                                    <li>{influence.countryId + " = " + influence.value}</li>
                                    <ul>
                                        {influence.sources.map(source => (
                                            <li>{source.cityId + " = " + source.value}</li>
                                        ))}
                                    </ul>
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
    const tile = GameStateHooks.useTileAt(props.selectedTile ? props.selectedTile.q : 9999999, props.selectedTile ? props.selectedTile.r : 999999);
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
    const city = GameStateHooks.useCityAt(props.selectedTile ? props.selectedTile.q : 9999999, props.selectedTile ? props.selectedTile.r : 999999);
    const canCreateCity = GameHooks.useValidateCreateCity(props.selectedTile ? props.selectedTile.q : 9999999, props.selectedTile ? props.selectedTile.r : 999999);
    const openFrame = UiStateHooks.useOpenFrame();

    function createCity() {
        if (props.selectedTile) {
            openFrame(
                "dialog.create-city",
                {
                    centered: {
                        width: 320,
                        height: 200
                    }
                },
                frameId => <CreateCityDialog frameId={frameId} tile={props.selectedTile!!}/>
            );
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
                {!city && (
                    <button onClick={createCity} disabled={!canCreateCity}>Create City</button>
                )}
            </>
        );
    } else {
        return null;
    }
}


function SectionMarkers(props: { selectedTile: TilePosition | null }): ReactElement | null {

    function placeMarker() {
        if (props.selectedTile) {
            AppConfig.turnAddCommand.addPlaceMarker(props.selectedTile);
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

    const canPlaceScout = GameHooks.useValidatePlaceScout(props.selectedTile ? props.selectedTile.q : 9999999, props.selectedTile ? props.selectedTile.r : 999999);

    function placeScout() {
        if (props.selectedTile) {
            AppConfig.turnAddCommand.addPlaceScout(props.selectedTile);
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
    const commands = LocalGameStateHooks.useCommandsAt(props.selectedTile ? props.selectedTile.q : 9999999, props.selectedTile ? props.selectedTile.r : 999999);
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


function CreateCityDialog(props: { frameId: string, tile: TilePosition }): ReactElement {
    const close = UiStateHooks.useCloseFrame(props.frameId);
    const [name, setName] = useState("");
    const tile = useTileAt(props.tile.q, props.tile.r)

    return (
        <div>
            Order creation of new city?
            <TextField value={name} onAccept={setName}/>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={() => onAcceptCity()}>Create City</button>
            {tile?.generalData?.owner !== undefined && tile?.generalData?.owner !== null && (
                <button onClick={() => onAcceptTown(tile?.generalData?.owner?.cityId!!)}>Create Town</button>
            )}
        </div>
    );

    function onCancel() {
        close();
    }

    function onAcceptCity() {
        close();
        AppConfig.turnAddCommand.addCreateCity(props.tile, name, null);
    }

    function onAcceptTown(cityId: string) {
        close();
        AppConfig.turnAddCommand.addCreateCity(props.tile, name, cityId);
    }
}