import type {ReactElement} from "react";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";
import type {SpriteRegion} from "@pages/dev/atlastool/app/atlas.types.ts";

export function SpriteList(props: AtlasEditor<true>): ReactElement {
    return (
        <div className="atlas-side__section">

            <div className="atlas-side__header">Sprites</div>

            {props.project.sprites.list.length === 0 && (
                <div className="atlas-side__empty">No sprites yet. Draw rectangles on the image.</div>
            )}

            <ul className="atlas-sprite-list">
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
        <li className={`atlas-sprite-list__item${props.selected ? " atlas-sprite-list__item--selected" : ""}`}>
            <button
                type="button"
                className="atlas-sprite-list__select"
                onClick={props.onSelect}
            >
                <span className="atlas-sprite-list__name">
                    {props.sprite.name || props.sprite.id}
                </span>
                <span className="atlas-sprite-list__meta">
                    {props.sprite.x},{props.sprite.y} · {props.sprite.width}×{props.sprite.height}
                </span>
            </button>
            <button
                type="button"
                className="atlas-sprite-list__delete"
                onClick={props.onDelete}
            >
                ✕
            </button>
        </li>
    );
}