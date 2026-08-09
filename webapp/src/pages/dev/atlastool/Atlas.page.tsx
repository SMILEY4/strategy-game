import {type DragEvent as ReactDragEvent, type ReactElement, useRef} from "react";
import {useAtlasEditor} from "./app/useAtlasEditor.ts";
import {useAtlasShortcuts} from "./app/useAtlasShortcuts.ts";
import {readFileAsText} from "./app/atlas.io.ts";
import pageStyles from "./AtlasPage.module.less";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {AtlasToolbar} from "@pages/dev/atlastool/AtlasToolbar.tsx";
import {AtlasCanvas} from "@pages/dev/atlastool/AtlasCanvas.tsx";
import {SpriteList} from "@pages/dev/atlastool/SpriteList.tsx";
import {SpriteEditor} from "@pages/dev/atlastool/SpriteEditor.tsx";


export function AtlasPage(): ReactElement {

    const editor = useAtlasEditor();

    useAtlasShortcuts(editor.project);

    if (editor.project == null) {
        return (
            <EmptyProject {...(editor as AtlasEditor<false>)} />
        );
    } else {
        return (
            <ProjectEditor {...(editor as AtlasEditor<true>)} />
        );
    }
}


export function EmptyProject(props: AtlasEditor<false>) {

    const inputRef = useRef<HTMLInputElement>(null);

    function handleOpen() {
        inputRef.current?.click();
    }

    function handleDrop(event: ReactDragEvent) {
        event.preventDefault();
        handleFiles(Array.from(event.dataTransfer.files ?? []));
    }

    function handleFiles(files: File[]) {
        const imageFile = files.find(file => file.type.startsWith("image/"));
        const jsonFile = files.find(file => file.type === "application/json" || file.name.endsWith(".json"));
        if (imageFile && jsonFile) {
            void loadImageAndProject(imageFile, jsonFile);
        } else if (imageFile) {
            void openImageFile(imageFile);
        } else if (jsonFile) {
            void loadProjectFile(jsonFile);
        }
    }

    async function openImageFile(file: File) {
        await props.load.image(file);
    }

    async function loadImageAndProject(imageFile: File, jsonFile: File) {
        const jsonText = await readFileAsText(jsonFile);
        try {
            await props.load.imageAndProject(imageFile, jsonText);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Could not load JSON");
        }
    }

    async function loadProjectFile(file: File) {
        const text = await readFileAsText(file);
        try {
            props.load.projectJson(text);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Could not load JSON");
        }
    }

    return (
        <div className={pageStyles.page} onDragOver={event => event.preventDefault()} onDrop={handleDrop}>
            <div className={pageStyles.dropzone}>
                <p>Drop an image here to start a new project, or <button type="button" onClick={handleOpen}>choose a file</button></p>
                <p>To continue a project, select or drop the image together with its exported JSON.</p>
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/*,.json"
                hidden
                onChange={event => {
                    const files = Array.from(event.target.files ?? []);
                    if (files.length > 0) {
                        handleFiles(files);
                    }
                    event.target.value = "";
                }}
            />
        </div>
    );
}


export function ProjectEditor(props: AtlasEditor<true>) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    return (
        <div className={pageStyles.page}>

            <AtlasToolbar {...props} canvasRef={canvasRef}/>

            <div className={pageStyles.main}>
                <div className={pageStyles.wrap}>
                    <AtlasCanvas {...props} canvasRef={canvasRef}/>
                    <div className={pageStyles.hint}>
                        tools: s select · d draw · p pan · wheel: zoom · middle-drag: pan · arrows: nudge (shift: ×10) · del: remove
                    </div>
                </div>

                <aside className={pageStyles.side}>
                    <SpriteList {...props}/>
                    {props.project.sprites.selectedId && (
                        <SpriteEditor {...props}/>
                    )}
                </aside>

            </div>

        </div>
    );
}