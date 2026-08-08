import type {ReactElement} from "react";
import type {SpriteRegion} from "./app/atlas.types.ts";

interface SpriteListProps {
    sprites: SpriteRegion[];
    selectedSpriteId: string | null;
    onSelect: (id: string | null) => void;
    onDelete: (id: string) => void;
}

/** Sidebar list of all sprites with select and delete actions. */
export function SpriteList(props: SpriteListProps): ReactElement {
    return (
        <div className="atlas-side__section">
            <div className="atlas-side__header">Sprites</div>
            {props.sprites.length === 0 && (
                <div className="atlas-side__empty">No sprites yet. Draw rectangles on the image.</div>
            )}
            <ul className="atlas-sprite-list">
                {props.sprites.map(sprite => {
                    const selected = sprite.id === props.selectedSpriteId;
                    return (
                        <li
                            key={sprite.id}
                            className={`atlas-sprite-list__item${selected ? " atlas-sprite-list__item--selected" : ""}`}
                        >
                            <button
                                type="button"
                                className="atlas-sprite-list__select"
                                onClick={() => props.onSelect(selected ? null : sprite.id)}
                            >
                                <span className="atlas-sprite-list__name">{sprite.name || sprite.id}</span>
                                <span className="atlas-sprite-list__meta">
                                    {sprite.x},{sprite.y} · {sprite.width}×{sprite.height}
                                </span>
                            </button>
                            <button
                                type="button"
                                className="atlas-sprite-list__delete"
                                onClick={() => props.onDelete(sprite.id)}
                            >
                                ✕
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
