import {useEffect} from "react";
import type {AtlasTool} from "./atlas.types.ts";
import {clampMove} from "./atlas.geometry.ts";
import type {AtlasEditor} from "./useAtlasEditor.ts";

/** Keyboard shortcuts: number/letter keys switch tools, arrows nudge the selected sprite, Delete removes it. */

const TOOL_SHORTCUTS: Record<string, AtlasTool> = {
    "1": "select",
    v: "select",
    "2": "draw",
    d: "draw",
    "3": "pan",
    p: "pan",
};

const ARROW_DELTAS: Record<string, { dx: number, dy: number }> = {
    ArrowLeft: {dx: -1, dy: 0},
    ArrowRight: {dx: 1, dy: 0},
    ArrowUp: {dx: 0, dy: -1},
    ArrowDown: {dx: 0, dy: 1},
};

/** Returns true for inputs/textareas/selects/contenteditable so typing isn't hijacked by shortcuts. */
function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }
    return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable;
}

/** Global keydown handler that drives tools and sprite editing. */
export function useAtlasKeyboard(editor: AtlasEditor, onToolChange: (tool: AtlasTool) => void) {
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (isEditableTarget(event.target) || event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }
            const nextTool = TOOL_SHORTCUTS[event.key.toLowerCase()];
            if (nextTool) {
                onToolChange(nextTool);
                return;
            }
            if (!editor.image || !editor.selectedSpriteId) {
                return;
            }
            if (event.key === "Delete" || event.key === "Backspace") {
                event.preventDefault();
                editor.deleteSprite(editor.selectedSpriteId);
                return;
            }
            const delta = ARROW_DELTAS[event.key];
            if (!delta) {
                return;
            }
            event.preventDefault();
            const step = event.shiftKey ? 10 : 1;
            const sprite = editor.sprites.find(candidate => candidate.id === editor.selectedSpriteId);
            if (sprite) {
                editor.updateSprite(sprite.id, clampMove(sprite, delta.dx * step, delta.dy * step, editor.imageSize));
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [editor, onToolChange]);
}
