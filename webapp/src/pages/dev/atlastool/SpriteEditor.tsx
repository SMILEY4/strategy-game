import type {ReactElement} from "react";
import type {AnnotationValue, Rect, SpriteRegion} from "./atlas.types.ts";

interface SpriteEditorProps {
    sprite: SpriteRegion;
    onUpdateRegion: (id: string, region: Partial<Rect>) => void;
    onUpdateMeta: (id: string, patch: { id?: string, name?: string }) => void;
    onAddAnnotation: (id: string, key: string) => void;
    onUpdateAnnotationKey: (id: string, oldKey: string, newKey: string) => void;
    onUpdateAnnotationValue: (id: string, key: string, text: string) => void;
    onRemoveAnnotation: (id: string, key: string) => void;
}

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
export function SpriteEditor(props: SpriteEditorProps): ReactElement {
    const sprite = props.sprite;

    function setRegionField(field: keyof Rect, rawValue: string) {
        const value = Math.round(Number(rawValue));
        if (!Number.isFinite(value)) {
            return;
        }
        const patch: Partial<Rect> = {};
        patch[field] = value;
        props.onUpdateRegion(sprite.id, patch);
    }

    return (
        <div className="atlas-side__section">
            <div className="atlas-side__header">Sprite</div>

            <label className="atlas-field">
                Id
                <input
                    value={sprite.id}
                    onChange={event => props.onUpdateMeta(sprite.id, {id: event.target.value})}
                    onKeyDown={event => event.stopPropagation()}
                />
            </label>
            <label className="atlas-field">
                Name
                <input
                    value={sprite.name}
                    onChange={event => props.onUpdateMeta(sprite.id, {name: event.target.value})}
                    onKeyDown={event => event.stopPropagation()}
                />
            </label>

            <div className="atlas-grid">
                {REGION_FIELDS.map(({field, label}) => (
                    <label className="atlas-field" key={field}>
                        {label}
                        <input
                            type="number"
                            value={sprite[field]}
                            onChange={event => setRegionField(field, event.target.value)}
                            onKeyDown={event => event.stopPropagation()}
                        />
                    </label>
                ))}
            </div>

            <div className="atlas-side__subheader">Annotations <span className="atlas-side__subnote">(values are JSON)</span></div>
            {Object.keys(sprite.annotations).length === 0 && (
                <div className="atlas-side__empty">No annotations.</div>
            )}
            {Object.entries(sprite.annotations).map(([key, value]) => (
                <div key={key} className="atlas-annotation">
                    <input
                        className="atlas-annotation__key"
                        value={key}
                        onChange={event => props.onUpdateAnnotationKey(sprite.id, key, event.target.value)}
                        onKeyDown={event => event.stopPropagation()}
                    />
                    <input
                        className="atlas-annotation__value"
                        value={annotationToText(value)}
                        onChange={event => props.onUpdateAnnotationValue(sprite.id, key, event.target.value)}
                        onKeyDown={event => event.stopPropagation()}
                    />
                    <button
                        type="button"
                        className="atlas-annotation__remove"
                        onClick={() => props.onRemoveAnnotation(sprite.id, key)}
                    >
                        ✕
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={() => props.onAddAnnotation(sprite.id, nextAnnotationKey(sprite.annotations))}
            >
                Add annotation
            </button>
        </div>
    );
}
