import {WindowStore} from "./windowStore";
import {WindowProperties} from "./windowProperties";
import {CssValue} from "./cssValue";


export function useWindowStack(): string[] {
    return WindowStore.useState(state => state.windows.map(it => it.id))
}

export function useWindowData(id: string) {
    const data = WindowStore.useState(state => state.windows.find(it => it.id === id))
    if (!data) {
        throw new Error("Could not find window with id " + id);
    }
    return {
        elementProps: {
            style: {
                left: CssValue.format(data.position.left),
                right: CssValue.format(data.position.right),
                top: CssValue.format(data.position.top),
                bottom: CssValue.format(data.position.bottom),
                width: CssValue.format(data.position.width),
                height: CssValue.format(data.position.height),
                margin: data.position.autoMargin ? "auto" : undefined,
            }
        },
        content: data.content,
    };
}

export function useOpenWindow(): (properties: WindowProperties) => void {
    const add = WindowStore.useState(state => state.add)
    return (properties: WindowProperties) => {
        add(properties)
    }
}