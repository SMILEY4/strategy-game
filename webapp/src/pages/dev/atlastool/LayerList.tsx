import {type ReactElement, useRef} from "react";
import classNames from "classnames";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import styles from "./LayerList.module.less";
import sideStyles from "./atlasSide.module.less";

/** Left panel: the project's input resources — the image layers of the sprite sheet. */
export function LayerList(props: AtlasEditor<true>): ReactElement {

    const inputRef = useRef<HTMLInputElement>(null);
    const {list, activeId} = props.project.images;
    const activeIndex = list.findIndex(layer => layer.id === activeId);

    async function addImages(files: File[]) {
        if (files.length === 0) {
            return;
        }
        try {
            await props.project.images.add(files);
        } catch (error) {
            window.alert(error instanceof Error ? error.message : "Could not add image");
        }
    }

    return (
        <div className={sideStyles.section}>
            <div className={styles.headerRow}>
                <span className={styles.title}>
                    Layers <span className={styles.note}>(same size)</span>
                </span>
                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => inputRef.current?.click()}
                    title="Add image layer"
                    aria-label="Add image layer"
                >
                    +
                </button>
            </div>

            {list.length > 0 && (
                <div className={styles.controls}>
                    <button
                        type="button"
                        className={styles.controlButton}
                        onClick={() => props.project.images.cycle(-1)}
                        title="Previous layer ([)"
                    >
                        ◀
                    </button>
                    <button
                        type="button"
                        className={styles.controlButton}
                        onClick={() => props.project.images.cycle(1)}
                        title="Next layer (])"
                    >
                        ▶
                    </button>
                    <span className={styles.counter}>{activeIndex + 1} / {list.length}</span>
                </div>
            )}

            <ul className={styles.list}>
                {list.map(layer => (
                    <li key={layer.id} className={classNames(styles.item, layer.id === activeId && styles.itemActive)}>
                        <button
                            type="button"
                            className={styles.select}
                            onClick={() => props.project.images.select(layer.id)}
                        >
                            <img className={styles.thumb} src={layer.element.src} alt="" />
                            <span className={styles.texts}>
                                <span className={styles.name}>{layer.name}</span>
                                <span className={styles.meta}>{layer.size.width}×{layer.size.height}</span>
                            </span>
                        </button>
                        <button
                            type="button"
                            className={styles.delete}
                            onClick={() => props.project.images.remove(layer.id)}
                            disabled={list.length <= 1}
                            title={list.length <= 1 ? "Cannot remove the only layer" : "Remove layer"}
                            aria-label="Remove layer"
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={event => {
                    const selected = Array.from(event.target.files ?? []);
                    if (selected.length > 0) {
                        void addImages(selected);
                    }
                    event.target.value = "";
                }}
            />
        </div>
    );
}
