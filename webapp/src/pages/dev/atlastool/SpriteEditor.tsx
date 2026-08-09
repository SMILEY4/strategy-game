import type {ReactElement} from "react";
import classNames from "classnames";
import type {Rect} from "./app/atlas.types.ts";
import {autoExpandSpriteBounds} from "./app/atlas.auto-expand.ts";
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

        </div>
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
