import type {ReactElement} from "react";
import type {AnnotationValue, Rect} from "./app/atlas.types.ts";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import {LockIcon} from "./atlas.icons.tsx";
import styles from "./SpriteEditor.module.less";
import sideStyles from "./atlasSide.module.less";

const REGION_FIELDS: Array<{ field: keyof Rect, label: string }> = [
    {field: "x", label: "X"},
    {field: "y", label: "Y"},
    {field: "width", label: "W"},
    {field: "height", label: "H"},
];

/** Serializes an annotation value for display in a text input. */
function annotationToText(value: AnnotationValue): string {
    return JSON.stringify(value);
}

/** Returns an annotation key that isn't taken yet (key, key1, key2, ...). */
function nextAnnotationKey(annotations: Record<string, AnnotationValue>): string {
    let index = 0;
    let key = "key";
    while (key in annotations) {
        index++;
        key = `key${index}`;
    }
    return key;
}

/** Sidebar editor for a single selected sprite: id/name, region fields, and annotations. */
export function SpriteEditor(props: AtlasEditor<true>): ReactElement {

    const sprite = props.project.sprites.selected;

    function setRegionField(field: keyof Rect, rawValue: string) {
        const value = Math.round(Number(rawValue));
        if (!Number.isFinite(value)) {
            return;
        }
        const patch: Partial<Rect> = {};
        patch[field] = value;
        props.project.sprites.updateRegion(sprite!.id, patch)
    }

    if (!sprite) {
        return <></>;
    } else {
        const locked = sprite.locked;
        const nameTaken = props.project.sprites.list.some(other => other.id !== sprite.id && other.name === sprite.name);
        return (
            <div className={sideStyles.section}>
                <div className={sideStyles.header}>Sprite</div>

                {locked && (
                    <div className={styles.lockedNote}>
                        <LockIcon/>
                        <span>This sprite is locked. Unlock it in the sprite list to edit.</span>
                    </div>
                )}

                <label className={styles.field}>
                    Id
                    <code className={styles.id}>{sprite.id}</code>
                </label>

                <label className={styles.field}>
                    Name
                    <input
                        disabled={locked}
                        value={sprite.name}
                        onChange={event => props.project.sprites.updateMeta(sprite.id, {name: event.target.value})}
                        onKeyDown={event => event.stopPropagation()}
                    />
                    {nameTaken && (
                        <div className={styles.warning}>Name already used by another sprite.</div>
                    )}
                </label>

                <div className={styles.grid}>
                    {REGION_FIELDS.map(({field, label}) => (
                        <label className={styles.field} key={field}>
                            {label}
                            <input
                                type="number"
                                disabled={locked}
                                value={sprite[field]}
                                onChange={event => setRegionField(field, event.target.value)}
                                onKeyDown={event => event.stopPropagation()}
                            />
                        </label>
                    ))}
                </div>

                <div className={sideStyles.subheader}>Annotations <span className={sideStyles.subnote}>(values are JSON)</span></div>
                {Object.keys(sprite.annotations).length === 0 && (
                    <div className={sideStyles.empty}>No annotations.</div>
                )}
                {Object.entries(sprite.annotations).map(([key, value]) => (
                    <div key={key} className={styles.annotation}>
                        <input
                            className={styles.key}
                            disabled={locked}
                            value={key}
                            onChange={event => props.project.sprites.updateAnnotationKey(sprite.id, key, event.target.value)}
                            onKeyDown={event => event.stopPropagation()}
                        />
                        <input
                            className={styles.value}
                            disabled={locked}
                            value={annotationToText(value)}
                            onChange={event => props.project.sprites.updateAnnotationValue(sprite.id, key, event.target.value)}
                            onKeyDown={event => event.stopPropagation()}
                        />
                        <button
                            type="button"
                            className={styles.remove}
                            disabled={locked}
                            onClick={() => props.project.sprites.removeAnnotation(sprite.id, key)}
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    disabled={locked}
                    onClick={() => props.project.sprites.addAnnotation(sprite.id, nextAnnotationKey(sprite.annotations))}
                >
                    Add annotation
                </button>
            </div>
        );
    }
}
