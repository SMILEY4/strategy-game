import type {ReactElement} from "react";
import classNames from "classnames";
import type {ParameterDef, Rect} from "./app/atlas.types.ts";
import {autoExpandSpriteBounds} from "./app/atlas.auto-expand.ts";
import {defaultValueForType} from "./app/atlas.parameters.ts";
import {LockIcon} from "./atlas.icons.tsx";
import styles from "./SpriteEditor.module.less";
import sideStyles from "./atlasSide.module.less";
import type {AtlasEditorProject} from "@pages/dev/atlastool/app/useAtlasEditor.ts";

const REGION_FIELDS: Array<{ field: keyof Rect, label: string }> = [
    {field: "x", label: "X"},
    {field: "y", label: "Y"},
    {field: "width", label: "W"},
    {field: "height", label: "H"},
];

export function SpriteEditor(props: AtlasEditorProject): ReactElement {
    const selected = props.sprites.selected;

    if (selected.length === 0) {
        return <></>;
    }

    if (selected.length === 1) {
        return <SingleSpriteEditor {...props} spriteId={selected[0].id}/>;
    }

    return <MultiSpriteEditor {...props}/>;
}

function SingleSpriteEditor(props: AtlasEditorProject & { spriteId: string }): ReactElement {
    const sprite = props.sprites.list.find(it => it.id === props.spriteId);
    if (!sprite) {
        return <></>;
    }

    const setRegionField = (field: keyof Rect, rawValue: string) => {
        const value = Math.round(Number(rawValue));
        if (!Number.isFinite(value)) {
            return;
        }
        const patch: Partial<Rect> = {};
        patch[field] = value;
        props.sprites.updateRegion(sprite.id, patch);
    };

    const locked = sprite.locked;
    const nameTaken = props.sprites.list.some(other => other.id !== sprite.id && other.name === sprite.name);
    const clipboard = props.sprites.attributesClipboard;
    const pasteable = clipboard != null
        && props.parameters.list.some(param => clipboard[param.id] !== undefined);
    return (
        <div className={classNames(sideStyles.section, styles.section)}>
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
                    onChange={event => props.sprites.updateName(sprite.id, event.target.value)}
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

            <button
                type="button"
                className={styles.expand}
                disabled={locked}
                title="Expand the region to tightly fit the opaque pixels on the active layer"
                onClick={() => {
                    const rect = autoExpandSpriteBounds(props.layers.active, sprite);
                    if (rect) {
                        props.sprites.updateRegion(sprite.id, rect);
                    }
                }}
            >
                Auto expand
            </button>

            <div className={styles.paramHeader}>
                <span>Parameters</span>
                <span className={styles.paramActions}>
                    <button
                        type="button"
                        onClick={() => props.sprites.copyAttributes(sprite.id)}
                        title="Copy this sprite's parameter values"
                    >
                        Copy
                    </button>
                    <button
                        type="button"
                        disabled={locked || !pasteable}
                        title={pasteable ? "Paste the copied parameter values onto this sprite" : "Copy a sprite's parameters first"}
                        onClick={() => props.sprites.pasteAttributes(sprite.id)}
                    >
                        Paste
                    </button>
                </span>
            </div>
            {props.parameters.list.length === 0 ? (
                <div className={sideStyles.empty}>
                    No parameters defined. Add them in the Parameters section.
                </div>
            ) : (
                <div className={styles.parameters}>
                    {props.parameters.list.map(param => (
                        <ParameterRow
                            key={param.id}
                            param={param}
                            value={sprite.attributes[param.id] ?? defaultValueForType(param.type)}
                            locked={locked}
                            onChange={value => props.sprites.setAttribute(sprite.id, param.id, value)}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}

function ParameterRow(props: {
    param: ParameterDef,
    value: boolean | string | number,
    locked: boolean,
    onChange: (value: boolean | string | number) => void,
}): ReactElement {
    if (props.param.type === "boolean") {
        return (
            <label className={styles.paramRow}>
                <span className={styles.paramLabel}>{props.param.name}</span>
                <input
                    type="checkbox"
                    disabled={props.locked}
                    checked={props.value === true}
                    onChange={event => props.onChange(event.target.checked)}
                />
            </label>
        );
    }
    if (props.param.type === "number") {
        return (
            <label className={styles.paramRow}>
                <span className={styles.paramLabel}>{props.param.name}</span>
                <input
                    className={styles.paramInput}
                    type="number"
                    disabled={props.locked}
                    value={String(props.value)}
                    onChange={event => {
                        const parsed = Number(event.target.value);
                        if (Number.isFinite(parsed)) {
                            props.onChange(parsed);
                        }
                    }}
                    onKeyDown={event => event.stopPropagation()}
                />
            </label>
        );
    }
    return (
        <label className={styles.paramRow}>
            <span className={styles.paramLabel}>{props.param.name}</span>
            <input
                className={styles.paramInput}
                type="text"
                disabled={props.locked}
                value={String(props.value)}
                onChange={event => props.onChange(event.target.value)}
                onKeyDown={event => event.stopPropagation()}
            />
        </label>
    );
}

function MultiSpriteEditor(props: AtlasEditorProject): ReactElement {
    return (
        <div className={classNames(sideStyles.section, styles.section)}>
            <div className={sideStyles.header}>Sprites</div>
            <div className={sideStyles.empty}>
                {props.sprites.selected.length} sprites selected. Only lock, auto expand and delete are available.
            </div>

            <div className={styles.multiActions}>
                <button type="button" onClick={() => props.sprites.toggleLockSelected()}>
                    Toggle lock
                </button>
                <button type="button" onClick={() => autoExpandSelected(props)}>
                    Auto expand
                </button>
                <button type="button" onClick={() => props.sprites.deleteSelected()}>
                    Delete
                </button>
            </div>
        </div>
    );
}

function autoExpandSelected(props: AtlasEditorProject) {
    props.history.beginBatch();
    for (const sprite of props.sprites.selected) {
        const rect = autoExpandSpriteBounds(props.layers.active, sprite);
        if (rect) {
            props.sprites.updateRegion(sprite.id, rect);
        }
    }
    props.history.endBatch();
}
