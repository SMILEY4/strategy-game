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
        </div>
    );

    function placeMarker() {
        if (selectedTile) {
            AppConfig.turnAddOrder.perform({
                q: selectedTile[0],
                r: selectedTile[1]
            });
        }
    }

}