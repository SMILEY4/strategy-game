import React, {ReactElement, useState} from "react";
import {GameHooks} from "../../../../core/actions/GameHooks";
import {GameStateHooks} from "../../../../external/state/game/gameStateHooks";
import {LocalGameStateHooks} from "../../../../external/state/localgame/localGameStateHooks";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";
import {AppConfig} from "../../../../main";
import {CommandCreateCity} from "../../../../models/state/command";
import {TilePosition} from "../../../../models/state/tilePosition";
import {TextField} from "../../../components/specific/TextField";


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
                <ul>
                    {
                        tile.influences.map(influence => (
                            <>
                                <li>{influence.country.countryId + " = " + influence.value}</li>
                                <ul>
                                    {influence.sources.map(source => (
                                        <li>{source.cityId + "/" + source.province.provinceId + " = " + source.value}</li>
                                    ))}
                                </ul>
                            </>
                        ))
                    }
                </ul>
            </>
        );
    } else {
        return null;
    }
}


function SectionOwner(props: { selectedTile: TilePosition | null }): ReactElement | null {
    const tile = GameStateHooks.useTileAt(props.selectedTile ? props.selectedTile.q : 9999999, props.selectedTile ? props.selectedTile.r : 999999);
    if (tile && tile.owner) {
        return (
            <>
                <h3>Owner</h3>
                <ul>
                    <li>{"Country = " + tile.owner?.country.countryId}</li>
                    <li>{"Province = " + tile.owner?.province.provinceId}</li>
                    <li>{"City = " + tile.owner?.cityId}</li>
                </ul>
            </>
        );
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
                        <li>{"country: " + city.country.countryId}</li>
                        <li>{"province: " + city.province.provinceId}</li>
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
    const country = GameStateHooks.usePlayerCountry();
    const tile = GameStateHooks.useTileAt(props.tile.q, props.tile.r)!!;
    const close = UiStateHooks.useCloseFrame(props.frameId);
    const [name, setName] = useState("");

    const availableProvinces = tile.influences
        .filter(i => i.country.countryId === country?.countryId)
        .flatMap(i => i.sources)
        .map(i => i.province)
        .filter((element, index, self) => self.indexOf(element) === index);

    return (
        <div>
            Order creation of new city?
            <TextField value={name} onAccept={setName}/>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={() => onAccept(null)}>Create with new Province</button>
            {
                availableProvinces.map(p => <button onClick={() => onAccept(p.provinceId)}>{"Create in " + p.provinceId}</button>)
            }
        </div>
    );

    function onCancel() {
        close();
    }

    function onAccept(provinceId: string | null) {
        close();
        AppConfig.turnAddCommand.addCreateCity(props.tile, name, provinceId)
    }

}