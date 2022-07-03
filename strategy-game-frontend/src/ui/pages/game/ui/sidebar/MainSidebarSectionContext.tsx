import {ReactElement} from "react";
import {Hooks} from "../../../../../core/hooks";
import {AppConfig} from "../../../../../main";
import useSelectedTile = Hooks.useSelectedTile;

export function MainSidebarSectionContext(): ReactElement {

    const selectedTile = useSelectedTile();

    return (
        <div className="content-area">
            {!selectedTile && (
                <div>Nothing Selected</div>
            )}
            {selectedTile && (
                <>
                    <div>Selected Tile</div>
                    <div>{selectedTile[0] + ", " + selectedTile[1]}</div>
                    <button onClick={onPlaceMarker}>Place Marker</button>
                </>
            )}
        </div>
    );

    function onPlaceMarker() {
        if (selectedTile) {
            AppConfig.turnAddOrder.perform({
                q: selectedTile[0],
                r: selectedTile[1]
            });
        }
    }

}