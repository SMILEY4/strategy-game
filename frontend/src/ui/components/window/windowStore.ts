import {WindowData, WindowPosition} from "./windowData";
import {
    WindowAnchor,
    WindowAreaAnchor,
    WindowHorizontalLineAnchor,
    WindowPointAnchor,
    WindowVerticalLineAnchor,
} from "./windowAnchor";
import {SetState} from "../../../common/zustandUtils";
import create from "zustand";
import {CssValue} from "./cssValue";
import {WindowProperties} from "./windowProperties";

export namespace WindowStore {

    export const ANCHOR_LEFT_SIDE = "left-side"
    export const ANCHOR_RIGHT_SIDE = "right-side"
    export const ANCHOR_CENTER_POINT = "center-point"
    export const ANCHOR_BOTTOM_POINT = "bottom-point"


    interface StateValues {
        windows: WindowData[],
        anchors: WindowAnchor[],
    }

    const initialStateValues: StateValues = {
        windows: [],
        anchors: [
            {
                id: ANCHOR_LEFT_SIDE,
                type: "area",
                top: CssValue.px(10 + 34),
                bottom: CssValue.px(10),
                left: CssValue.px(10),
                right: CssValue.percent(70),
            } as WindowAreaAnchor,
            {
                id: ANCHOR_RIGHT_SIDE,
                type: "area",
                top: CssValue.px(10 + 34),
                bottom: CssValue.px(10),
                right: CssValue.px(10),
                left: CssValue.percent(70),
            } as WindowAreaAnchor,
            {
                id: ANCHOR_CENTER_POINT,
                type: "point",
                top: CssValue.percent(50),
                left: CssValue.percent(50),
                bottom: null,
                right: null,
                side: "centered"
            } as WindowPointAnchor,
            {
                id: ANCHOR_BOTTOM_POINT,
                type: "point",
                left: CssValue.percent(50),
                bottom: CssValue.px(10),
                top: null,
                right: null,
                autoMargin: true,
                side: "above"
            } as WindowPointAnchor,
        ],
    };

    interface StateActions {
        add: (properties: WindowProperties) => void,
        remove: (id: string) => void,
        modifyPosition: (id: string, action: (position: WindowPosition) => WindowPosition) => void,
        bringToFront: (id: string) => void,
    }

    export interface State extends StateValues, StateActions {
    }


    export const useState = create<State>()((set) => ({
        ...initialStateValues,
        ...stateActions(set),
    }));


    function stateActions(set: SetState<State>): StateActions {
        return {
            add: (properties: WindowProperties) => set((state: State) => {
                const data = createWindowData(properties, state.anchors);
                return {
                    ...state,
                    windows: [...state.windows.filter(it => it.id !== data.id), data],
                };
            }),
            remove: (id: string) => set((state: State) => {
                return {
                    ...state,
                    windows: state.windows.filter(it => it.id !== id),
                };
            }),
            modifyPosition: (id: string, action: (position: WindowPosition) => WindowPosition) => set((state: State) => {
                return {
                    ...state,
                    windows: state.windows.map(it => {
                        if(it.id === id) {
                            return {
                                ...it,
                                position: action(it.position)
                            }
                        } else {
                            return it;
                        }
                    }),
                };
            }),
            bringToFront: (id: string) => set((state: State) => {
                const window = state.windows.find(it => it.id === id)
                if(!window) {
                    return state;
                }
                return {
                    ...state,
                    windows: [...state.windows.filter(it => it.id !== id), window]
                }
            }),
        };
    }

    function createWindowData(properties: WindowProperties, anchors: WindowAnchor[]): WindowData {

        const anchor = anchors.find(it => it.id === properties.anchor);
        if (anchor == null) {
            throw new Error("Could not find anchor " + properties.anchor);
        }

        let position: WindowPosition = {
            top: null,
            bottom: null,
            left: null,
            right: null,
            width: null,
            height: null,
            transform: null,
        };

        if (anchor.type === "point") {
            position = WindowPointAnchor.buildPosition(anchor as WindowPointAnchor);
            if(properties.preferredWidth) {
                position.width = CssValue.raw(properties.preferredWidth)
            }
            if(properties.preferredHeight) {
                position.height = CssValue.raw(properties.preferredHeight)
            }
        }
        if (anchor.type === "line_vertical") {
            position = WindowVerticalLineAnchor.buildPosition(anchor as WindowVerticalLineAnchor);
        }
        if (anchor.type === "line_horizontal") {
            position = WindowHorizontalLineAnchor.buildPosition(anchor as WindowHorizontalLineAnchor);
        }
        if (anchor.type === "area") {
            position = WindowAreaAnchor.buildPosition(anchor as WindowAreaAnchor);
        }

        return {
            id: properties.id,
            blockOthers: properties.blockOthers === true,
            content: properties.content,
            position: position,
        };
    }

}