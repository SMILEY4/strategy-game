import {useEffect} from "react";
import type {AtlasTool} from "./atlas.types.ts";
import {clampMove} from "../atlas.geometry.ts";
import type {AtlasEditorProject} from "@pages/dev/atlastool/app/atlas.editor.ts";

/**
 * Global keydown handler that drives tools and sprite editing.
 */
export function useAtlasShortcuts(project: AtlasEditorProject | null) {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => project && handleKeyDown(project, event);
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [project]);
}

const TOOL_SHORTCUTS: Record<string, AtlasTool> = {
    "1": "select",
    "v": "select",
    "2": "draw",
    "d": "draw",
    "3": "pan",
    "p": "pan",
};

const ARROW_DELTAS: Record<string, { dx: number, dy: number }> = {
    ArrowLeft: {dx: -1, dy: 0},
    ArrowRight: {dx: 1, dy: 0},
    ArrowUp: {dx: 0, dy: -1},
    ArrowDown: {dx: 0, dy: 1},
};

/**
 * handles a global key down event and triggers a matching shortcut.
 */
function handleKeyDown(project: AtlasEditorProject, event: KeyboardEvent) {

    // don't trigger shortcut under these circumstances:
    const target = event.target;
    const isTargetEditable = target instanceof HTMLElement && (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
    );
    if (isTargetEditable || event.ctrlKey || event.metaKey || event.altKey) {
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
    if ((event.key === "Delete" || event.key === "Backspace") && project.sprites.selectedId) {
        event.preventDefault();
        project.sprites.delete(project.sprites.selectedId);
        return;
    }

    // check move viewport and trigger
    const delta = ARROW_DELTAS[event.key];
    if (delta) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const sprite = project.sprites.list.find(candidate => candidate.id === project.sprites.selectedId);
        if (sprite) {
            project.sprites.updateRegion(sprite.id, clampMove(sprite, delta.dx * step, delta.dy * step, project.image.size));
        }
        return;
    }

}