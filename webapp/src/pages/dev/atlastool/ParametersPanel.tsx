import type {ReactElement} from "react";
import classNames from "classnames";
import type {ParameterType} from "./app/atlas.types.ts";
import styles from "./ParametersPanel.module.less";
import sideStyles from "./atlasSide.module.less";
import type {AtlasEditorProject} from "@pages/dev/atlastool/app/useAtlasEditor.ts";

const PARAMETER_TYPES: ParameterType[] = ["string", "number", "boolean"];

export function ParametersPanel(props: AtlasEditorProject): ReactElement {

    const duplicateNames = new Set<string>();
    const seen = new Set<string>();
    for (const param of props.parameters.list) {
        const key = param.name.trim();
        if (key && seen.has(key)) {
            duplicateNames.add(key);
        }
        seen.add(key);
    }
    const invalidNames = invalidNameMessage(duplicateNames, props.parameters.list);

    return (
        <div className={sideStyles.section}>
            <div className={styles.headerRow}>
                <span className={styles.title}>
                    Parameters <span className={styles.note}>(all sprites)</span>
                </span>
                <button
                    type="button"
                    className={styles.addButton}
                    onClick={() => props.parameters.add()}
                    title="Add parameter"
                    aria-label="Add parameter"
                >
                    +
                </button>
            </div>

            {props.parameters.list.length === 0 && (
                <div className={sideStyles.empty}>
                    No parameters yet. Every sprite gets each parameter.
                </div>
            )}

            <ul className={styles.list}>
                {props.parameters.list.map(param => {
                    const name = param.name.trim();
                    const invalid = name === "" || duplicateNames.has(name);
                    return (
                        <li key={param.id} className={classNames(styles.item, invalid && styles.itemInvalid)}>
                            <input
                                className={styles.name}
                                type="text"
                                value={param.name}
                                placeholder="name"
                                onChange={event => props.parameters.updateName(param.id, event.target.value)}
                                onKeyDown={event => event.stopPropagation()}
                            />
                            <select
                                className={styles.type}
                                value={param.type}
                                onChange={event => props.parameters.updateType(param.id, event.target.value as ParameterType)}
                                onKeyDown={event => event.stopPropagation()}
                            >
                                {PARAMETER_TYPES.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className={styles.remove}
                                onClick={() => props.parameters.remove(param.id)}
                                title="Remove parameter"
                                aria-label="Remove parameter"
                            >
                                ✕
                            </button>
                        </li>
                    );
                })}
            </ul>

            {invalidNames && (
                <div className={styles.warning}>{invalidNames}</div>
            )}
        </div>
    );
}

function invalidNameMessage(duplicateNames: Set<string>, parameters: {name: string}[]): string | null {
    const hasEmpty = parameters.some(param => param.name.trim() === "");
    if (hasEmpty) {
        return "Parameters need a name.";
    }
    if (duplicateNames.size > 0) {
        return "Parameter names must be unique.";
    }
    return null;
}
