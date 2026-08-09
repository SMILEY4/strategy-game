import {useEffect, useEffectEvent} from "react";
import type {AtlasTool} from "./atlas.types.ts";
import {clampMove} from "./atlas.geometry.ts";
import type {AtlasEditorProject} from "@pages/dev/atlastool/app/useAtlasEditor.ts";

export function useAtlasShortcuts(project: AtlasEditorProject | null) {
    const onKeyDown = useEffectEvent((event: KeyboardEvent) => project && handleKeyDown(project, event));

    useEffect(() => {
        const listener = (event: KeyboardEvent) => onKeyDown(event);
        window.addEventListener("keydown", listener);
        return () => window.removeEventListener("keydown", listener);
    }, []);
}

export const TOOL_HOTKEYS: Record<AtlasTool, string> = {
    Select: "S",
    Draw: "D",
    Pan: "P",
};

const TOOL_SHORTCUTS: Record<string, AtlasTool> = {};
for (const [tool, key] of Object.entries(TOOL_HOTKEYS) as Array<[AtlasTool, string]>) {
    TOOL_SHORTCUTS[key.toLowerCase()] = tool;
}

const ARROW_DELTAS: Record<string, { dx: number, dy: number }> = {
    ArrowLeft: {dx: -1, dy: 0},
    ArrowRight: {dx: 1, dy: 0},
    ArrowUp: {dx: 0, dy: -1},
    ArrowDown: {dx: 0, dy: 1},
};

function handleKeyDown(project: AtlasEditorProject, event: KeyboardEvent) {

    // don't trigger shortcut under these circumstances:
    const target = event.target;
    const isTargetEditable = target instanceof HTMLElement && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
    );
    if (isTargetEditable) {
        return;
    }

    // undo/redo
    if (event.ctrlKey || event.metaKey) {
        const key = event.key.toLowerCase();
        if (key === "z") {
            event.preventDefault();
            if (event.shiftKey) {
                project.history.redo();
            } else {
                project.history.undo();
            }
        } else if (key === "y") {
            event.preventDefault();
            project.history.redo();
        }
        return;
    }

    if (event.altKey) {
        return;
    }

    // deselect
    if (event.key === "Escape") {
        event.preventDefault();
        project.sprites.select(null);
        return;
    }

    // check tool change and trigger
    const nextTool = TOOL_SHORTCUTS[event.key.toLowerCase()];
    if (nextTool) {
        event.preventDefault();
        project.tool.select(nextTool);
        return;
    }

    // check delete sprite and trigger
    if ((event.key === "Delete" || event.key === "Backspace") && project.sprites.selected.length > 0) {
        event.preventDefault();
        project.sprites.deleteSelected();
        return;
    }

    // check move viewport and trigger
    const delta = ARROW_DELTAS[event.key];
    if (delta && project.sprites.selected.length === 1) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const sprite = project.sprites.selected[0];
        project.sprites.updateRegion(sprite.id, clampMove(sprite, delta.dx * step, delta.dy * step, project.atlas.size));
        return;
    }

}