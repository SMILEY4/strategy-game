import create, {SetState} from "zustand";
import {CameraState} from "../../../models/cameraState";
import {CommandPlaceMarker} from "../../../models/commandPlaceMarker";

export namespace GameStore {

    interface StateValues {
        gameId: null | string
        currentState: "idle" | "loading" | "active",
        turnState: "active" | "submitted",
        playerCommands: CommandPlaceMarker[],
        camera: CameraState,
        tileMouseOver: null | [number, number],
        tileSelected: null | [number, number]
    }

    const initialStateValues: StateValues = {
        gameId: null,
        currentState: "idle",
        playerCommands: [],
        turnState: "active",
        camera: {
            x: 0,
            y: 0,
            zoom: 1
        },
        tileMouseOver: null,
        tileSelected: null
    };

    interface StateActions {
        setLoading: (gameId: string) => void;
        setCurrentState: (state: "idle" | "loading" | "active") => void;
        setTurnState: (state: "active" | "submitted") => void;
        addCommand: (command: CommandPlaceMarker) => void;
        clearCommands: () => void;
        moveCamera: (dx: number, dy: number) => void;
        setTileMouseOver: (pos: [number, number] | null) => void;
        setTileSelected: (pos: [number, number] | null) => void;
        zoomCamera: (d: number) => void;
    }

    function stateActions(set: SetState<State>): StateActions {
        return {
            setLoading: (gameId: string) => set(() => ({
                gameId: gameId,
                currentState: "loading"
            })),
            setCurrentState: (state: "idle" | "loading" | "active") => set(() => ({
                currentState: state
            })),
            setTurnState: (state: "active" | "submitted") => set(() => ({
                turnState: state,
            })),
            addCommand: (command: CommandPlaceMarker) => set(prev => ({
                playerCommands: [...prev.playerCommands, command],
            })),
            clearCommands: () => set(() => ({
                playerCommands: []
            })),
            moveCamera: (dx: number, dy: number) => set(prev => ({
                camera: {
                    x: prev.camera.x + (dx) / prev.camera.zoom,
                    y: prev.camera.y - (dy) / prev.camera.zoom,
                    zoom: prev.camera.zoom
                }
            })),
            setTileMouseOver: (pos: [number, number] | null) => set(() => ({
                tileMouseOver: pos
            })),
            setTileSelected: (pos: [number, number] | null) => set(() => ({
                tileSelected: pos
            })),
            zoomCamera: (d: number) => set(prev => ({
                camera: {
                    x: prev.camera.x,
                    y: prev.camera.y,
                    zoom: Math.max(0.01, prev.camera.zoom - d)
                }
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