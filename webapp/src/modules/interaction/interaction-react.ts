import {useSyncExternalStore} from "react";
import type {InteractionManager, InteractionSnapshot} from "./interaction.types.ts";

export function useInteractionSnapshot(manager: InteractionManager): InteractionSnapshot<unknown, string> | null {
    return useSyncExternalStore(manager.subscribe, manager.getSnapshot, manager.getSnapshot);
}
