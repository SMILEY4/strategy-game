import {TopBar} from "@pages/game/gameui/topbar/TopBar.tsx";
import {InfoPanel} from "@pages/game/gameui/infopanel/InfoPanel.tsx";
import {folder, useControls} from "leva";
import {DI} from "@app/app.ts";
import {initialDebugDataValues} from "@app/features/game/database/debug.database.ts";


export function GameUi() {
    useDevOverlay();
    return (
        <>
            <TopBar/>
            <InfoPanel/>
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
        })
    });

}