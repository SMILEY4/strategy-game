import type {ReactElement} from "react";
import type {AtlasEditor} from "@pages/dev/atlastool/app/atlas.editor.ts";

export function SpriteList(props: AtlasEditor<true>): ReactElement {
    return (
        <div className="atlas-side__section">
            <div className="atlas-side__header">Sprites</div>
            {props.project.sprites.list.length === 0 && (
                <div className="atlas-side__empty">No sprites yet. Draw rectangles on the image.</div>
            )}
            <ul className="atlas-sprite-list">
                {props.project.sprites.list.map(sprite => {
                    const selected = sprite.id === props.project.sprites.selectedId;
                    return (
                        <li
                            key={sprite.id}
                            className={`atlas-sprite-list__item${selected ? " atlas-sprite-list__item--selected" : ""}`}
                        >
                            <button
                                type="button"
                                className="atlas-sprite-list__select"
                                onClick={() => props.project.sprites.select(selected ? null : sprite.id)}
                            >
                                <span className="atlas-sprite-list__name">{sprite.name || sprite.id}</span>
                                <span className="atlas-sprite-list__meta">
                                    {sprite.x},{sprite.y} · {sprite.width}×{sprite.height}
                                </span>
                            </button>
                            <button
                                type="button"
                                className="atlas-sprite-list__delete"
                                onClick={() => props.project.sprites.delete(sprite.id)}
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
