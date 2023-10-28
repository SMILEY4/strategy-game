import {SetState} from "../../shared/zustandUtils";
import create from "zustand";
import {TileIdentifier} from "../../models/tile";
import {MapMode} from "../../models/mapMode";

export namespace LocalGameStore {

    interface StateValues {
        selectedTile: TileIdentifier | null;
        hoverTile: TileIdentifier | null;
        mapMode: MapMode;
    }

    const initialStateValues: StateValues = {
        selectedTile: null,
        hoverTile: null,
        mapMode: MapMode.DEFAULT,
    };

    interface StateActions {
        setSelectedTile: (tile: TileIdentifier | null) => void;
        setHoverTile: (tile: TileIdentifier | null) => void;
        setMapMode: (mapMode: MapMode) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setSelectedTile: (tile: TileIdentifier | null) => set(() => ({
                selectedTile: tile,
            })),
            setHoverTile: (tile: TileIdentifier | null) => set(() => ({
                hoverTile: tile,
            })),
            setMapMode: (mapMode: MapMode) => set(() => ({
                mapMode: mapMode,
            })),
        };
    }

    export interface State extends StateValues, StateActions {
    }

    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set),
    }));

}
