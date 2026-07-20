import {createContext, useContext} from "react";

interface TabbarContextValue {
    selectedTab: string;
    onSelectTab: (value: string) => void;
    registerTab: (value: string, element: HTMLElement | null) => void;
}

export const TabbarContext = createContext<TabbarContextValue | null>(null);

export function useTabbarContext(): TabbarContextValue {
    const ctx = useContext(TabbarContext);
    if (!ctx) {
        throw new Error("Tabbar.* components must be used within Tabbar.Root");
    }
    return ctx;
}
