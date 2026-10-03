import {useEffect, useRef} from "react";
import {twPane} from "@modules/uicomponents/tweakpane/tweakpane-builder.ts";
import {DI} from "@app/app.ts";
import {downloadRenderGraphAsGraphviz} from "@modules/rendergraph/tools/graphviz.ts";
import {gameGraph} from "@pages/game/renderer/graph/game-graph.ts";
import {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";

export function DevUIPane() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        return createDevPanel(containerRef.current);
    }, []);

    return <div className="dev-ui-pane" ref={containerRef}/>;
}

function createDevPanel(container: HTMLElement): () => void {

    const database = DI.developerSettingsDatabase;
    const state = structuredClone(database.get());

    const pane = twPane(container, "Developer Settings", pane => {
        pane.onChange(() => database.set(structuredClone(state)))

        pane.folder("Tools", tools => {
            tools.button("Download .dot", it => {
                it.setLabel("Render Graph")
                it.onClick(() => {
                    const graph = gameGraph(new RenderGraphBuilder(), null as any, null as any);
                    void downloadRenderGraphAsGraphviz(graph)
                })
            })
        })

        pane.folder("World Geometry", geometry => {
            geometry.number("Hex Offset Scale", it => {
                it.bind(state.renderer.geometry, "hexOffsetScale");
                it.setRange(0, 1);
            });
        });

        pane.folder("Terrain", terrain => {
            terrain.folder("Land Mask", landMask => {
                landMask.number("Noise 1 Scale", it => {
                    it.bind(state.renderer.terrain.landMask, "noise1Scale");
                    it.setRange(0, 4);
                });
                landMask.number("Noise 1 Amplitude", it => {
                    it.bind(state.renderer.terrain.landMask, "noise1Amplitude");
                    it.setRange(0, 1);
                });
                landMask.number("Noise 2 Scale", it => {
                    it.bind(state.renderer.terrain.landMask, "noise2Scale");
                    it.setRange(0, 4);
                });
                landMask.number("Noise 2 Amplitude", it => {
                    it.bind(state.renderer.terrain.landMask, "noise2Amplitude");
                    it.setRange(0, 1);
                });
            });
            terrain.folder("Base Terrain", baseTerrain => {
                baseTerrain.number("Scale", it => {
                    it.bind(state.renderer.terrain.base, "scale");
                    it.setRange(0.5, 2);
                });
                baseTerrain.color("Land (light)", it => {
                    it.bind(state.renderer.terrain.base, "landLightColor");
                });
                baseTerrain.color("Land (dark)", it => {
                    it.bind(state.renderer.terrain.base, "landDarkColor");
                });
                baseTerrain.color("Water (light)", it => {
                    it.bind(state.renderer.terrain.base, "waterLightColor");
                });
                baseTerrain.color("Water (dark)", it => {
                    it.bind(state.renderer.terrain.base, "waterDarkColor");
                });
            });
            terrain.folder("Coastline", coastline => {
                coastline.number("Edge Softness", it => {
                    it.bind(state.renderer.terrain.coastline, "edgeSoftness");
                    it.setRange(0, 1);
                });
                coastline.number("Edge threshold", it => {
                    it.bind(state.renderer.terrain.coastline, "edgeThreshold");
                    it.setRange(0, 1);
                });
            });
        });

        pane.folder("Fog of War", fogOfWar => {
            fogOfWar.number("Scale", it => {
                it.bind(state.renderer.fogOfWar, "tileScale");
                it.setRange(0.5, 2);
            });
            fogOfWar.number("Opacity Discovered", it => {
                it.bind(state.renderer.fogOfWar, "discoveredOpacity");
                it.setRange(0, 1);
            });
        });

        pane.folder("Tile Highlights", tileHighlights => {
            tileHighlights.folder("Selected", selected => {
                selected.color("Color", it => {
                    it.bind(state.renderer.tileHighlights.selected, "color");
                    it.withAlpha(true)
                });
                selected.number("scale", it => {
                    it.bind(state.renderer.tileHighlights.selected, "scale");
                    it.setRange(0, 2)
                });
                selected.number("height", it => {
                    it.bind(state.renderer.tileHighlights.selected, "height");
                    it.setRange(0, 5)
                });
                selected.number("Concealed opacity", it => {
                    it.bind(state.renderer.tileHighlights.selected, "concealedOpacity");
                    it.setRange(0, 1)
                });
            });
            tileHighlights.folder("Available", selected => {
                selected.color("Color (option)", it => {
                    it.bind(state.renderer.tileHighlights.available, "color");
                    it.withAlpha(true)
                });
                selected.color("Color (available)", it => {
                    it.bind(state.renderer.tileHighlights.available, "hoverColor");
                    it.withAlpha(true)
                });
            });
        });

        pane.folder("Tile Grid", tileGrid => {
            tileGrid.color("Color", it => {
                it.bind(state.renderer.tileGrid, "color");
                it.withAlpha(true)
            });
            tileGrid.number("Thickness", it => {
                it.bind(state.renderer.tileGrid, "thickness");
                it.setRange(0, 1)
            });
            tileGrid.number("Fade Distance", it => {
                it.bind(state.renderer.tileGrid, "fadeDistance");
                it.setRange(0, 10)
            });
        });

        pane.folder("Overlays", overlays => {
            overlays.folder("Fill", fill => {
                fill.number("Noise Scale", it => {
                    it.bind(state.renderer.overlays.fill, "noiseScale");
                    it.setRange(0, 4)
                });
                fill.number("Noise Strength", it => {
                    it.bind(state.renderer.overlays.fill, "noiseStrength");
                    it.setRange(0, 1)
                });
            });
            overlays.folder("Border", fill => {
                fill.number("Concealed Opacity", it => {
                    it.bind(state.renderer.overlays.border, "concealedOpacity");
                    it.setRange(0, 4)
                });
            });
            overlays.folder("Route Highlights", fill => {
                fill.color("Color", it => {
                    it.bind(state.renderer.overlays.route, "color");
                });
            });
        });
    });

    return () => pane.dispose();
}