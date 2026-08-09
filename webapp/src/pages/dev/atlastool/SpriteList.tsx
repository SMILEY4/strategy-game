import type {ReactElement} from "react";
import classNames from "classnames";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import type {SpriteRegion} from "@pages/dev/atlastool/app/atlas.types.ts";
import styles from "./SpriteList.module.less";
import sideStyles from "./atlasSide.module.less";

export function SpriteList(props: AtlasEditor<true>): ReactElement {
    return (
        <div className={sideStyles.section}>

            <div className={sideStyles.header}>Sprites</div>

            {props.project.sprites.list.length === 0 && (
                <div className={sideStyles.empty}>No sprites yet. Draw rectangles on the image.</div>
            )}

            <ul className={styles.list}>
                {props.project.sprites.list.map(sprite => {
                    return (
                        <SpriteListEntry
                            key={sprite.id}
                            sprite={sprite}
                            selected={sprite.id === props.project.sprites.selectedId}
                            onDelete={() => props.project.sprites.delete(sprite.id)}
                            onSelect={() => props.project.sprites.select(sprite.id)}
                        />
                    );
                })}
            </ul>

        </div>
    );
}

function SpriteListEntry(props: { sprite: SpriteRegion, selected: boolean, onDelete: () => void, onSelect: () => void }) {
    return (
        <li className={classNames(styles.item, props.selected && styles.itemSelected)}>
            <button
                type="button"
                className={styles.select}
                onClick={props.onSelect}
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
                className={styles.delete}
                onClick={props.onDelete}
            >
                ✕
            </button>
        </li>
    );
}