import {type DragEvent as ReactDragEvent, type ReactElement, useRef} from "react";
import {useAtlasEditor} from "./app/useAtlasEditor.ts";
import {useAtlasShortcuts} from "./app/useAtlasShortcuts.ts";
import {readFileAsText} from "./app/atlas.io.ts";
import "./atlas.page.less";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {AtlasToolbar} from "@pages/dev/atlastool/AtlasToolbar.tsx";
import {AtlasCanvas} from "@pages/dev/atlastool/AtlasCanvas.tsx";
import {SpriteList} from "@pages/dev/atlastool/SpriteList.tsx";
import {SpriteEditor} from "@pages/dev/atlastool/SpriteEditor.tsx";


export function AtlasPage(): ReactElement {

    const editor = useAtlasEditor();

    // const {
    //     imageInputRef,
    //     projectInputRef,
    //     openImageFile,
    //     loadProjectFile,
    //     handleDrop,
    // } = useAtlasFiles(editor, () => editor.project?.viewport.set(INITIAL_VIEWPORT));

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

    async function openImageFile(file: File) {
        await props.load.image(file);
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
        <div className="atlas-page" onDragOver={event => event.preventDefault()} onDrop={handleDrop}>
            <div className="atlas-dropzone">
                <p>Drop an image here to start a new project, or <button type="button" onClick={handleOpen}>choose a file</button></p>
                <p>To continue a project, load the image together with its exported JSON (select or drop both at once).</p>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*" // todo: also load jsons ???
                hidden
                onChange={event => {
                    const file = event.target.files?.[0];
                    if (file) {
                        void openImageFile(file);
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
        <div className="atlas-page">

            <AtlasToolbar {...props} canvasRef={canvasRef}/>

            <div className="atlas-main">
                <div className="atlas-canvas-wrap">
                    <AtlasCanvas {...props} canvasRef={canvasRef}/>
                    <div className="atlas-canvas-wrap__hint">
                        tools: s select · d draw · p pan · wheel: zoom · middle-drag: pan · arrows: nudge (shift: ×10) · del: remove
                    </div>
                </div>

                <aside className="atlas-side">
                    <SpriteList {...props}/>
                    {props.project.sprites.selectedId && (
                        <SpriteEditor {...props}/>
                    )}
                </aside>

            </div>

        </div>
    );
}