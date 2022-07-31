import {ReactElement} from "react";
import {Hooks} from "../../../../core/hooks";
import {AppConfig} from "../../../../main";


export function MenuSelectedTile(): ReactElement {
    const selectedTile = Hooks.useSelectedTile();
    return (
        <div>
            <h3>Selected Tile</h3>
            <ul>
                {selectedTile && <li>{"q: " + selectedTile[0]}</li>}
                {selectedTile && <li>{"r: " + selectedTile[1]}</li>}
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
                q: selectedTile[0],
                r: selectedTile[1]
            });
        }
    }

    function createCity() {
        if (selectedTile) {
            AppConfig.turnAddCommand.perform({
                commandType: "create-city",
                q: selectedTile[0],
                r: selectedTile[1]
            });
        }
    }

}