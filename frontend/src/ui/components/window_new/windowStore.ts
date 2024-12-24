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

    interface StateValues {
        windows: WindowData[],
        anchors: WindowAnchor[],
    }

    const initialStateValues: StateValues = {
        windows: [],
        anchors: [
            {
                id: "left-edge",
                type: "line_vertical",
                top: CssValue.px(10),
                bottom: CssValue.px(10),
                left: CssValue.px(10),
                right: null,
                side: "right",
            } as WindowVerticalLineAnchor,
            {
                id: "right-edge",
                type: "line_vertical",
                top: CssValue.px(10),
                bottom: CssValue.px(10),
                right: CssValue.px(10),
                left: null,
                side: "left",
            } as WindowVerticalLineAnchor,
            {
                id: "bottom-edge",
                type: "line_horizontal",
                left: CssValue.px(10),
                right: CssValue.px(10),
                bottom: CssValue.px(10),
                top: null,
                side: "top"
            } as WindowHorizontalLineAnchor,
            {
                id: "top-edge",
                type: "line_horizontal",
                left: CssValue.px(10),
                right: CssValue.px(10),
                top: CssValue.px(10 + 22),
                bottom: null,
                side: "bottom",
            } as WindowHorizontalLineAnchor,
            {
                id: "bottom-right",
                type: "area",
                bottom: CssValue.px(10),
                right: CssValue.px(10),
                width: CssValue.px(200),
                height: CssValue.px(200),
                left: null,
                top: null,
            } as WindowAreaAnchor,
            {
                id: "center",
                type: "point",
                top: CssValue.px(0),
                left: CssValue.px(0),
                bottom: CssValue.px(0),
                right: CssValue.px(0),
                autoMargin: true
            } as WindowPointAnchor,
        ],
    };

    interface StateActions {
        add: (properties: WindowProperties) => void,
        remove: (id: string) => void,
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
            autoMargin: false,
            fitContent: false
        };

        if (anchor.type === "point") {
            position = WindowPointAnchor.buildPosition(anchor as WindowPointAnchor);
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
            content: properties.content,
            position: position,
        };
    }

}