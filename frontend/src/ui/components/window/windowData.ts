import {CssValue} from "./cssValue";

export interface WindowData {
    windowId: string,
    groupId: string,
    stackIndex: number,
    isPinned: boolean,
    content: any,
    blockOthers: boolean,
    position: WindowPosition
}

export interface WindowPosition {
    top: CssValue | null,
    bottom: CssValue | null,
    left: CssValue | null,
    right: CssValue | null,
    width: CssValue | null,
    height: CssValue | null,
    transform: string | null
}