import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {DeveloperSettings} from "@app/features/game/database/developer-settings.database.ts";

export type UniformColor = [number, number, number, number];

export function developerSetting(
    g: RenderGraphBuilder,
    settings: DataRenderGraphNode<VersionedContainer<DeveloperSettings>>,
    select: (value: DeveloperSettings) => unknown,
): DataRenderGraphNode<unknown> {
    return g.dataTransformer(
        g.transform({
            inputs: [settings],
            func: data => select(data.data),
        }),
    ) as DataRenderGraphNode<unknown>;
}

export function hexToUniformColor(hex: string): UniformColor {
    const value = hex.replace("#", "");
    const normalized = value.length === 3
        ? value.split("").map(channel => channel + channel).join("")
        : value;
    const read = (offset: number) => Number.parseInt(normalized.slice(offset, offset + 2), 16) / 255;
    return [read(0), read(2), read(4), normalized.length >= 8 ? read(6) : 1];
}
