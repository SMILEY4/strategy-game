import {ReactElement, useState} from "react";
import {GameHooks} from "../../../../core/actions/GameHooks";
import {LocalGameStateHooks} from "../../../../external/state/localgame/localGameStateHooks";
import {UiStateHooks} from "../../../../external/state/ui/uiStateHooks";
import {AppConfig} from "../../../../main";
import {Command, CommandCreateCity} from "../../../../models/state/command";
import {TextField} from "../../../components/specific/TextField";


export function MenuSelectedTile(): ReactElement {
    const selectedTile = LocalGameStateHooks.useSelectedTile();
    const openFrame = UiStateHooks.useOpenFrame();
    const canCreateCity = GameHooks.useValidateCreateCity(selectedTile ? selectedTile.q : 9999999, selectedTile ? selectedTile.r : 999999);

    return (
        <div>
            <h3>Selected Tile</h3>
            <ul>
                {selectedTile && <li>{"q: " + selectedTile.q}</li>}
                {selectedTile && <li>{"r: " + selectedTile.r}</li>}
                {!selectedTile && <li>no tile selected</li>}
            </ul>
            <button onClick={placeMarker} disabled={false}>Place Marker</button>
            <button onClick={createCity} disabled={!canCreateCity}>Create City</button>
        </div>
    );

    function placeMarker() {
        if (selectedTile) {
            AppConfig.turnAddCommand.perform({
                commandType: "place-marker",
                cost: {
                    money: 0
                },
                q: selectedTile.q,
                r: selectedTile.r
            } as Command);
        }
    }

    function createCity() {
        if (selectedTile) {
            openFrame(
                "dialog.create-city", 300, 30, 320, 200,
                frameId => <CreateCityDialog frameId={frameId} q={selectedTile.q} r={selectedTile.r}/>
            );
        }
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