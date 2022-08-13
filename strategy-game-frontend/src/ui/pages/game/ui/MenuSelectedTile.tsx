import React, {ReactElement, useState} from "react";
import {GameHooks} from "../../../../core/actions/GameHooks";
import {GameStateHooks} from "../../../../external/state/game/gameStateHooks";
import {LocalGameStateHooks} from "../../../../external/state/localgame/localGameStateHooks";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";
import {AppConfig} from "../../../../main";
import {Command, CommandCreateCity} from "../../../../models/state/command";
import {TilePosition} from "../../../../models/state/tilePosition";
import {TextField} from "../../../components/specific/TextField";


export function MenuSelectedTile(): ReactElement {
    const selectedTile = LocalGameStateHooks.useSelectedTilePosition();
    return (
        <div>
            <h3>Selected Tile</h3>
            <SelectedTileSection selectedTile={selectedTile}/>
            <SectionMarkers selectedTile={selectedTile}/>
            <SectionCity selectedTile={selectedTile}/>
            <SectionCommands selectedTile={selectedTile}/>
        </div>
    );
}


function SelectedTileSection(props: { selectedTile: TilePosition | null }): ReactElement {
    return (
        <ul>
            {props.selectedTile && <li>{"q: " + props.selectedTile.q}</li>}
            {props.selectedTile && <li>{"r: " + props.selectedTile.r}</li>}
            {!props.selectedTile && <li>no tile selected</li>}
        </ul>
    );
}


function SectionMarkers(props: { selectedTile: TilePosition | null }): ReactElement | null {

    function placeMarker() {
        if (props.selectedTile) {
            AppConfig.turnAddCommand.perform({
                commandType: "place-marker",
                cost: {
                    money: 0
                },
                q: props.selectedTile.q,
                r: props.selectedTile.r
            } as Command);
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


function SectionCity(props: { selectedTile: TilePosition | null }): ReactElement | null {
    const city = GameStateHooks.useCityAt(props.selectedTile ? props.selectedTile.q : 9999999, props.selectedTile ? props.selectedTile.r : 999999);
    const canCreateCity = GameHooks.useValidateCreateCity(props.selectedTile ? props.selectedTile.q : 9999999, props.selectedTile ? props.selectedTile.r : 999999);
    const openFrame = UiStateHooks.useOpenFrame();


    function createCity() {
        if (props.selectedTile) {
            openFrame(
                "dialog.create-city", 300, 30, 320, 200,
                frameId => <CreateCityDialog frameId={frameId} q={props.selectedTile!!.q} r={props.selectedTile!!.r}/>
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


function CreateCityDialog(props: { frameId: string, q: number, r: number }): ReactElement {

    const close = UiStateHooks.useCloseFrame(props.frameId);
    const [name, setName] = useState("");

    return (
        <div>
            Order creation of new city?
            <TextField value={name} onAccept={setName}/>
            <button onClick={onCancel}>Cancel</button>
            <button onClick={onAccept}>Accept</button>
        </div>
    );

    function onCancel() {
        close();
    }

    function onAccept() {
        close();
        AppConfig.turnAddCommand.perform({
            commandType: "create-city",
            cost: {
                money: 50
            },
            q: props.q,
            r: props.r,
            name: name,
        } as CommandCreateCity);
    }

}