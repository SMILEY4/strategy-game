import {type ReactElement, useRef} from "react";
import classNames from "classnames";
import styles from "./LayerList.module.less";
import sideStyles from "./atlasSide.module.less";
import type {AtlasEditorProject} from "@pages/dev/atlastool/app/useAtlasEditor.ts";

export function LayerList(props: AtlasEditorProject): ReactElement {

    const inputRef = useRef<HTMLInputElement>(null);

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

            <ul className={styles.list}>
                {props.layers.list.map(layer => (
                    <li key={layer.id} className={classNames(styles.item, layer.id === props.layers.active.id && styles.itemActive)}>
                        <button
                            type="button"
                            className={styles.select}
                            onClick={() => props.layers.select(layer.id)}
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
                            onClick={() => props.layers.remove(layer.id)}
                            disabled={props.layers.list.length <= 1}
                            title={props.layers.list.length <= 1 ? "Cannot remove the only layer" : "Remove layer"}
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
                        void props.layers.add(selected);
                    }
                    event.target.value = "";
                }}
            />
        </div>
    );
}
