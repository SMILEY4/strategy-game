import type {ReactElement} from "react";
import classNames from "classnames";
import type {SpriteRegion} from "@pages/dev/atlastool/app/atlas.types.ts";
import {LockIcon, UnlockIcon} from "./atlas.icons.tsx";
import styles from "./SpriteList.module.less";
import sideStyles from "./atlasSide.module.less";
import type {AtlasEditorProject} from "@pages/dev/atlastool/app/useAtlasEditor.ts";

export function SpriteList(props: AtlasEditorProject): ReactElement {
    return (
        <div className={classNames(sideStyles.section, styles.section)}>

            <div className={sideStyles.header}>Sprites</div>

            {props.sprites.list.length === 0 && (
                <div className={sideStyles.empty}>No sprites yet. Draw rectangles on the image.</div>
            )}

            <ul className={styles.list}>
                {props.sprites.list.map(sprite => {
                    return (
                        <SpriteListEntry
                            key={sprite.id}
                            sprite={sprite}
                            selected={props.sprites.selected.some(candidate => candidate.id === sprite.id)}
                            onDelete={() => props.sprites.delete(sprite.id)}
                            onSelect={() => props.sprites.select(sprite.id)}
                            onToggle={() => props.sprites.toggleSelect(sprite.id)}
                            onToggleLock={() => props.sprites.toggleLock(sprite.id)}
                        />
                    );
                })}
            </ul>

        </div>
    );
}

function SpriteListEntry(props: {
    sprite: SpriteRegion,
    selected: boolean,
    onDelete: () => void,
    onSelect: () => void,
    onToggle: () => void,
    onToggleLock: () => void,
}) {
    const locked = props.sprite.locked;
    return (
        <li className={classNames(styles.item, props.selected && styles.itemSelected, locked && styles.itemLocked)}>
            <button
                type="button"
                className={styles.select}
                title={props.selected ? "Click to select, Shift/Ctrl+Click to deselect" : "Click to select, Shift/Ctrl+Click to multi-select"}
                onClick={event => {
                    if (event.shiftKey || event.ctrlKey || event.metaKey) {
                        props.onToggle();
                    } else {
                        props.onSelect();
                    }
                }}
            >
                <span className={styles.name}>
                    {props.sprite.name || props.sprite.id}
                </span>
                <span className={styles.meta}>
                    {props.sprite.x},{props.sprite.y} · {props.sprite.width}×{props.sprite.height}
                </span>
            </button>
            <button
                type="button"
                className={styles.lock}
                onClick={props.onToggleLock}
                title={locked ? "Unlock sprite" : "Lock sprite"}
                aria-label={locked ? "Unlock sprite" : "Lock sprite"}
                aria-pressed={locked}
            >
                {locked ? <LockIcon/> : <UnlockIcon/>}
            </button>
            <button
                type="button"
                className={styles.delete}
                onClick={props.onDelete}
                disabled={locked}
                title={locked ? "Unlock to delete" : "Delete sprite"}
                aria-label={locked ? "Unlock to delete" : "Delete sprite"}
            >
                ✕
            </button>
        </li>
    );
}