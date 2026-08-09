import type {ReactElement} from "react";
import classNames from "classnames";
import type {Rect} from "./app/atlas.types.ts";
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

    const sprite = props.sprites.selected;

    function setRegionField(field: keyof Rect, rawValue: string) {
        const value = Math.round(Number(rawValue));
        if (!Number.isFinite(value)) {
            return;
        }
        const patch: Partial<Rect> = {};
        patch[field] = value;
        props.sprites.updateRegion(sprite!.id, patch);
    }

    if (!sprite) {
        return <></>;
    } else {
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

            </div>
        );
    }
}
