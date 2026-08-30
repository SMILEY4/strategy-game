import {TopBar} from "@pages/game/gameui/topbar/TopBar.tsx";
import {QuickInfo} from "@pages/game/gameui/quickinfo/QuickInfo.tsx";
import {folder, useControls} from "leva";
import {DI} from "@app/app.ts";
import {initialDebugDataValues} from "@app/features/game/database/debug.database.ts";


export function GameUi() {
    useDevOverlay();
    return (
        <>
            <TopBar/>
            <QuickInfo/>
        </>
    );

}



function useDevOverlay() {

    useControls("rendering", {
        randomHexOffsetScale: {
            label: "rnd hex offset",
            value: initialDebugDataValues.renderer.randomHexOffsetScale,
            min: 0,
            max: 1,
            transient: false,
            onChange: it => DI.debugDatabase.update(data => ({
                ...data,
                renderer: {
                    ...data.renderer,
                    randomHexOffsetScale: it
                }
            }))
        },
        "base terrain": folder({
            scaleBaseTerrain: {
                label: "scale",
                value: initialDebugDataValues.renderer.baseTerrain.scale,
                min: 0.1,
                max: 3,
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        baseTerrain: {
                            ...data.renderer.baseTerrain,
                            scale: it
                        }
                    }
                }))
            },
        }),
        "terrain mask": folder({
            scaleTerrainMask: {
                label: "scale",
                value: initialDebugDataValues.renderer.terrainMask.scale,
                min: 0.1,
                max: 3,
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        terrainMask: {
                            ...data.renderer.terrainMask,
                            scale: it
                        }
                    }
                }))
            },
            cutoffTerrainMask: {
                label: "cutoff",
                value: initialDebugDataValues.renderer.terrainMask.cutoff,
                min: 0,
                max: 1,
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        terrainMask: {
                            ...data.renderer.terrainMask,
                            cutoff: it
                        }
                    }
                }))
            },
        }),
        "fog of war": folder({
            scaleFogOfWar: {
                label: "scale",
                value: initialDebugDataValues.renderer.fogOfWar.scale,
                min: 0.1,
                max: 3,
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        fogOfWar: {
                            ...data.renderer.fogOfWar,
                            scale: it
                        }
                    }
                }))
            },
        }),
        "map details": folder({
            msaaFactor: {
                label: "msaa",
                value: initialDebugDataValues.renderer.mapDetails.msaa,
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        mapDetails: {
                            ...data.renderer.mapDetails,
                            msaa: it
                        }
                    }
                }))
            }
        }),
        "selected tile": folder({
            thicknessSelectedTile: {
                label: "thickness",
                value: initialDebugDataValues.renderer.selectedTile.thickness,
                min: 0,
                max: 1,
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        selectedTile: {
                            ...data.renderer.selectedTile,
                            thickness: it
                        }
                    }
                }))
            },
            softnessSelectedTile: {
                label: "softness",
                value: initialDebugDataValues.renderer.selectedTile.softness,
                min: 0,
                max: 1,
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        selectedTile: {
                            ...data.renderer.selectedTile,
                            softness: it
                        }
                    }
                }))
            },
            colorSelectedTile: {
                label: "color",
                value: {
                    r: initialDebugDataValues.renderer.selectedTile.color[0] * 255,
                    g: initialDebugDataValues.renderer.selectedTile.color[1] * 255,
                    b: initialDebugDataValues.renderer.selectedTile.color[2] * 255,
                    a: initialDebugDataValues.renderer.selectedTile.color[3],
                },
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        selectedTile: {
                            ...data.renderer.selectedTile,
                            color: [
                                it.r / 255,
                                it.g / 255,
                                it.b / 255,
                                it.a
                            ]
                        }
                    }
                }))
            },
        }),

        "grid": folder({
            thicknessGrid: {
                label: "thickness",
                value: initialDebugDataValues.renderer.grid.thickness,
                min: 0,
                max: 0.2,
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        grid: {
                            ...data.renderer.grid,
                            thickness: it
                        }
                    }
                }))
            },
            colorGrid: {
                label: "color",
                value: {
                    r: initialDebugDataValues.renderer.grid.color[0] * 255,
                    g: initialDebugDataValues.renderer.grid.color[1] * 255,
                    b: initialDebugDataValues.renderer.grid.color[2] * 255,
                    a: initialDebugDataValues.renderer.grid.color[3],
                },
                transient: false,
                onChange: it => DI.debugDatabase.update(data => ({
                    ...data,
                    renderer: {
                        ...data.renderer,
                        grid: {
                            ...data.renderer.grid,
                            color: [
                                it.r / 255,
                                it.g / 255,
                                it.b / 255,
                                it.a
                            ]
                        }
                    }
                }))
            },
        })

    });

}