import {useSyncExternalStore} from "react";
import type {InteractionManager, InteractionSnapshot} from "./interaction.types.ts";

export function useInteractionSnapshot<State, Event>(
    manager: InteractionManager<State, Event>,
): InteractionSnapshot<State> | null {
    return useSyncExternalStore(manager.subscribe, manager.getSnapshot, manager.getSnapshot);
}
