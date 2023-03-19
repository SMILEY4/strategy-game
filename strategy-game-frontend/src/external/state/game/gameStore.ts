import create from "zustand";
import {CameraState} from "../../../core/models/cameraState";
import {Command} from "../../../core/models/command";
import {GameState} from "../../../core/models/gameState";
import {MapMode} from "../../../core/models/mapMode";
import {TilePosition} from "../../../core/models/tilePosition";
import {generateId} from "../../../shared/utils";
import {SetState} from "../../../shared/zustandUtils";

export namespace GameStore {

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


    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set)
    }));

}