import create, {SetState} from "zustand";
import {CameraState} from "../../../models/state/cameraState";
import {Command} from "../../../models/state/command";
import {GameState} from "../../../models/state/gameState";
import {MapMode} from "../../../models/state/mapMode";
import {TilePosition} from "../../../models/state/tilePosition";
import {generateId} from "../../../shared/utils";

export namespace LocalGameStore {

    export interface StateValues {
        revisionId: string,
        currentState: GameState,
        commands: Command[],
        camera: CameraState,
        tileMouseOver: TilePosition | null,
        tileSelected: TilePosition | null,
        mapMode: MapMode
    }

    const initialStateValues: StateValues = {
        revisionId: generateId(),
        currentState: GameState.OUT_OF_GAME,
        commands: [],
        camera: {
            x: 0,
            y: 0,
            zoom: 1
        },
        tileMouseOver: null,
        tileSelected: null,
        mapMode: MapMode.DEFAULT
    };

    interface StateActions {
        setCurrentState: (state: GameState) => void;
        addCommand: (command: Command) => void;
        clearCommands: () => void;
        setCameraPosition: (x: number, y: number) => void;
        setCameraZoom: (zoom: number) => void;
        setTileMouseOver: (pos: TilePosition | null) => void;
        setTileSelected: (pos: TilePosition | null) => void;
        setMapMode: (mode: MapMode) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setCurrentState: (state: GameState) => set(() => ({
                currentState: state,
                revisionId: generateId()
            })),
            addCommand: (command: Command) => set(prev => ({
                commands: [...prev.commands, command],
                revisionId: generateId()
            })),
            clearCommands: () => set(() => ({
                commands: [],
                revisionId: generateId()
            })),
            setCameraPosition: (x: number, y: number) => set(prev => ({
                camera: {
                    ...prev.camera,
                    x: x,
                    y: y,
                },
            })),
            setCameraZoom: (zoom: number) => set(prev => ({
                camera: {
                    ...prev.camera,
                    zoom: zoom
                }
            })),
            setTileMouseOver: (pos: TilePosition | null) => set(() => ({
                tileMouseOver: pos,
            })),
            setTileSelected: (pos: TilePosition | null) => set(() => ({
                tileSelected: pos,
            })),
            setMapMode: (mode: MapMode) => set(() => ({
                mapMode: mode,
            })),
        };
    }

    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>((set: SetState<State>) => ({
        ...initialStateValues,
        ...stateActions(set)
    }));

}