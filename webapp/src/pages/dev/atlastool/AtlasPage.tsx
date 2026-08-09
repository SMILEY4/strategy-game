import {type DragEvent as ReactDragEvent, type ReactElement, type RefObject, useRef, useState} from "react";
import {type AtlasEditor, type AtlasEditorProject, useAtlasEditor} from "./app/useAtlasEditor.ts";
import {useAtlasShortcuts} from "./app/useAtlasShortcuts.ts";
import {createImageFromDataUrl, isImageFile, isJsonFile, readFileAsDataUrl, readFileAsText} from "./app/atlas.io.ts";
import type {Size} from "./app/atlas.types.ts";
import pageStyles from "./AtlasPage.module.less";
import {AtlasToolbar} from "@pages/dev/atlastool/AtlasToolbar.tsx";
import {AtlasCanvas} from "@pages/dev/atlastool/AtlasCanvas.tsx";
import {LayerList} from "@pages/dev/atlastool/LayerList.tsx";
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
            <ProjectEditor {...(editor as AtlasEditor<true>).project} canvasRef={editor.refs.canvas} />
        );
    }
}


interface PendingFile {
    file: File;
    kind: "image" | "json";
    element?: HTMLImageElement;
    size?: Size;
}

/** Start screen: collect image layers and an optional project JSON, validate, then open. */
export function EmptyProject(props: AtlasEditor<false>): ReactElement {

    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<PendingFile[]>([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function addFiles(newFiles: File[]) {
        setError(null);
        const images = newFiles.filter(isImageFile);
        const jsons = newFiles.filter(isJsonFile);
        const decoded = await Promise.all(images.map(async file => {
            try {
                const element = await createImageFromDataUrl(await readFileAsDataUrl(file));
                return {
                    file,
                    kind: "image" as const,
                    element,
                    size: {width: element.naturalWidth, height: element.naturalHeight},
                };
            } catch {
                return null;
            }
        }));
        const pending: PendingFile[] = [
            ...decoded.filter((item): item is NonNullable<typeof item> => item !== null),
            ...jsons.map(file => ({file, kind: "json" as const})),
        ];
        setFiles(prev => [...prev, ...pending]);
    }

    function handleDrop(event: ReactDragEvent) {
        event.preventDefault();
        void addFiles(Array.from(event.dataTransfer.files ?? []));
    }

    function removeFile(index: number) {
        setFiles(prev => prev.filter((_, i) => i !== index));
    }

    const images = files.filter(file => file.kind === "image");
    const jsons = files.filter(file => file.kind === "json");

    const errors: string[] = [];
    if (images.length === 0) {
        errors.push("Add at least one image (one file per layer).");
    }
    if (jsons.length > 1) {
        errors.push("Only one project file (JSON) is allowed.");
    }
    if (images.length >= 2) {
        const first = images[0].size!;
        if (images.some(file => file.size!.width !== first.width || file.size!.height !== first.height)) {
            errors.push("All images must have the same size.");
        }
    }
    const valid = errors.length === 0 && images.length > 0;

    async function handleOpen() {
        const imageFiles = images.map(file => file.file);
        const jsonFile = jsons[0]?.file ?? null;
        setBusy(true);
        setError(null);
        try {
            const jsonText = jsonFile ? await readFileAsText(jsonFile) : null;
            await props.open(imageFiles, jsonText);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Could not open project");
            setBusy(false);
        }
    }

    return (
        <div className={pageStyles.page} onDragOver={event => event.preventDefault()} onDrop={handleDrop}>
            <div className={pageStyles.openPanel}>
                <div className={pageStyles.openTitle}>Atlas project</div>
                <p className={pageStyles.openDescription}>
                    Drop or choose the images of your sprite sheet — one file per layer (e.g. albedo, normals,
                    roughness) — plus an optional project JSON. All images must share the same size.
                </p>

                <button
                    type="button"
                    className={pageStyles.openDropzone}
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                >
                    <span>Drag &amp; drop files here</span>
                    <span className={pageStyles.openDropHint}>or click to choose files</span>
                </button>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*,.json,application/json"
                    hidden
                    onChange={event => {
                        const selected = Array.from(event.target.files ?? []);
                        if (selected.length > 0) {
                            void addFiles(selected);
                        }
                        event.target.value = "";
                    }}
                />

                {files.length > 0 && (
                    <ul className={pageStyles.fileList}>
                        {files.map((item, index) => (
                            <li key={index} className={pageStyles.fileItem}>
                                {item.kind === "image" ? (
                                    <img className={pageStyles.thumb} src={item.element?.src} alt=""/>
                                ) : (
                                    <span className={pageStyles.thumbPlaceholder}>JSON</span>
                                )}
                                <span className={pageStyles.fileName}>{item.file.name}</span>
                                <span className={pageStyles.fileMeta}>
                                    {item.kind === "json" ? "project" : item.size ? `${item.size.width}×${item.size.height}` : "…"}
                                </span>
                                <button
                                    type="button"
                                    className={pageStyles.removeFile}
                                    onClick={() => removeFile(index)}
                                    title="Remove file"
                                    aria-label="Remove file"
                                >
                                    ✕
                                </button>
                            </li>
                        ))}
                    </ul>
                )}

                {(error || errors.length > 0) && (
                    <div className={pageStyles.openError}>
                        {errors.map(message => (
                            <div key={message}>{message}</div>
                        ))}
                        {error && <div>{error}</div>}
                    </div>
                )}

                <div className={pageStyles.openActions}>
                    <button
                        type="button"
                        className={pageStyles.openButton}
                        onClick={() => void handleOpen()}
                        disabled={!valid || busy}
                    >
                        {busy ? "Opening…" : "Open"}
                    </button>
                    {files.length > 0 && (
                        <button type="button" onClick={() => setFiles([])} disabled={busy}>Clear</button>
                    )}
                </div>
            </div>
        </div>
    );
}


export function ProjectEditor(props: AtlasEditorProject & { canvasRef?: RefObject<HTMLCanvasElement | null> }) {
    return (
        <div className={pageStyles.page}>

            <AtlasToolbar {...props} canvasRef={props.canvasRef}/>

            <div className={pageStyles.main}>
                <aside className={pageStyles.sideLeft}>
                    <LayerList {...props}/>
                </aside>

                <div className={pageStyles.wrap}>
                    <AtlasCanvas {...props} canvasRef={props.canvasRef}/>
                    <div className={pageStyles.hint}>
                        tools: s select · d draw · p pan · wheel: zoom · middle-drag: pan · arrows: nudge (shift: ×10) · del: remove · [ ]:
                        cycle layers
                    </div>
                </div>

                <aside className={pageStyles.side}>
                    <SpriteList {...props}/>
                    {props.sprites.selected.length > 0 && (
                        <SpriteEditor {...props}/>
                    )}
                </aside>

            </div>

        </div>
    );
}
