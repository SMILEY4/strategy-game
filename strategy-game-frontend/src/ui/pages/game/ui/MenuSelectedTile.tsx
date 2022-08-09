import {ReactElement} from "react";
import {LocalGameStateHooks} from "../../../../external/state/localgame/localGameStateHooks";
import {AppConfig} from "../../../../main";
import {Command} from "../../../../models/state/command";


export function MenuSelectedTile(): ReactElement {
    const selectedTile = LocalGameStateHooks.useSelectedTile();
    return (
        <div>
            <h3>Selected Tile</h3>
            <ul>
                {selectedTile && <li>{"q: " + selectedTile.q}</li>}
                {selectedTile && <li>{"r: " + selectedTile.r}</li>}
                {!selectedTile && <li>no tile selected</li>}
            </ul>
            <button onClick={placeMarker} disabled={false}>Place Marker</button>
            <button onClick={createCity} disabled={false}>Create City</button>
        </div>
    );

    function placeMarker() {
        if (selectedTile) {
            AppConfig.turnAddCommand.perform({
                commandType: "place-marker",
                q: selectedTile.q,
                r: selectedTile.r
            } as Command);
        }
    }

    function createCity() {
        if (selectedTile) {
            AppConfig.turnAddCommand.perform({
                commandType: "create-city",
                q: selectedTile.q,
                r: selectedTile.r
            } as Command);
        }
    }

}