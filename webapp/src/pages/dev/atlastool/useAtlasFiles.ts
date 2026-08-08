import {useRef, type DragEvent as ReactDragEvent} from "react";
import type {AtlasEditor} from "./useAtlasEditor.ts";
import {readFileAsText} from "./atlas.io.ts";

/** Owns the file/image inputs and drag-and-drop handling for loading images and project JSON. */
export function useAtlasFiles(editor: AtlasEditor, onImageLoaded: () => void) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const projectInputRef = useRef<HTMLInputElement>(null);

    async function openImageFile(file: File) {
        await editor.loadImageFile(file);
        onImageLoaded();
    }

    async function loadProjectFile(file: File) {
        const text = await readFileAsText(file);
        try {
            editor.applyProjectJson(text);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Could not load JSON");
        }
    }

    function handleDrop(event: ReactDragEvent) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer.files ?? []);
        const imageFile = files.find(file => file.type.startsWith("image/"));
        const jsonFile = files.find(file => file.type === "application/json" || file.name.endsWith(".json"));
        if (imageFile && jsonFile) {
            void (async () => {
                await openImageFile(imageFile);
                await loadProjectFile(jsonFile);
            })();
        } else if (imageFile) {
            void openImageFile(imageFile);
        } else if (jsonFile) {
            void loadProjectFile(jsonFile);
        }
    }

    return {imageInputRef, projectInputRef, openImageFile, loadProjectFile, handleDrop};
}
