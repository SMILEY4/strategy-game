import {SetState} from "../../../shared/zustandUtils";
import create from "zustand";
import {TileIdentifier} from "../../../models/tile";

export namespace LocalGameStore {

    interface StateValues {
        selectedTile: TileIdentifier | null;
        hoverTile: TileIdentifier | null;
    }

    const initialStateValues: StateValues = {
        selectedTile: null,
        hoverTile: null
    };

    interface StateActions {
        setSelectedTile: (tile: TileIdentifier | null) => void;
        setHoverTile: (tile: TileIdentifier | null) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setSelectedTile: (tile: TileIdentifier | null) => set(() => ({
                selectedTile: tile,
            })),
            setHoverTile: (tile: TileIdentifier | null) => set(() => ({
                hoverTile: tile,
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
