import create from "zustand";
import {CameraState} from "../../../_old_core/models/cameraState";
import {Command} from "../../../_old_core/models/command";
import {GameState} from "../../../_old_core/models/gameState";
import {MapMode} from "../../../_old_core/models/mapMode";
import {TilePosition} from "../../../_old_core/models/tilePosition";
import {generateId} from "../../../shared/utils";
import {SetState} from "../../../shared/zustandUtils";
import {CityCreationPreview} from "../../../_old_core/models/CityCreationPreview";

export namespace GameStore {

    export interface StateValues {
        gameId: string
        revisionId: string,
        currentState: GameState,
        commands: Command[],
        camera: CameraState,
        tileMouseOver: TilePosition | null,
        tileSelected: TilePosition | null,
        mapMode: MapMode,
        previewCityCreation: CityCreationPreview | null
    }

    const initialStateValues: StateValues = {
        gameId: "?",
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
        mapMode: MapMode.DEFAULT,
        previewCityCreation: null
    };

    interface StateActions {
        setGameId: (id: string) => void;
        setCurrentState: (state: GameState) => void;
        addCommand: (command: Command) => void;
        clearCommands: () => void;
        setCameraPosition: (x: number, y: number) => void;
        setCameraZoom: (zoom: number) => void;
        setTileMouseOver: (pos: TilePosition | null) => void;
        setTileSelected: (pos: TilePosition | null) => void;
        setMapMode: (mode: MapMode) => void;
        setPreviewCityCreation: (preview: CityCreationPreview | null) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setGameId: (id: string) => set(() => ({
                gameId: id,
                revisionId: generateId()
            })),
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
            setPreviewCityCreation: (preview: CityCreationPreview | null) => set(() => ({
                previewCityCreation: preview,
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