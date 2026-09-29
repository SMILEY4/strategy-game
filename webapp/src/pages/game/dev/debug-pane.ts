import {Pane} from "tweakpane";
import {DI} from "@app/app.ts";

export function createDebugPane(container: HTMLElement): () => void {
    const database = DI.debugDatabase;
    const state = structuredClone(database.get());

    const pane = new Pane({
        container,
        document: container.ownerDocument,
        title: "Developer UI",
    });
    pane.element.style.width = "100%";
    const paneStyles = container.ownerDocument.defaultView?.getComputedStyle(pane.element);
    const backgroundColor = paneStyles && paneStyles.backgroundColor !== "rgba(0, 0, 0, 0)"
        ? paneStyles.backgroundColor
        : paneStyles?.getPropertyValue("--cnt-bg").trim();
    if (backgroundColor) {
        container.ownerDocument.body.style.backgroundColor = backgroundColor;
        container.style.backgroundColor = backgroundColor;
    }


    const terrain = pane.addFolder({title: "Terrain"});

    const geometry = terrain.addFolder({title: "Geometry"});
    geometry.addBinding(state.renderer, "randomHexOffsetScale", {
        label: "Random hex offset scale",
        min: 0,
        max: 4,
        step: 0.01,
    });

    const landMask = terrain.addFolder({title: "Land mask"});
    landMask.addBinding(state.renderer.landMask, "noise1Scale", {label: "Noise 1 scale", min: 0, max: 4, step: 0.01});
    landMask.addBinding(state.renderer.landMask, "noise1Amplitude", {label: "Noise 1 amplitude", min: 0, max: 1, step: 0.01});
    landMask.addBinding(state.renderer.landMask, "noise2Scale", {label: "Noise 2 scale", min: 0, max: 4, step: 0.01});
    landMask.addBinding(state.renderer.landMask, "noise2Amplitude", {label: "Noise 2 amplitude", min: 0, max: 1, step: 0.01});

    const baseTerrain = terrain.addFolder({title: "Base terrain"});
    baseTerrain.addBinding(state.renderer.baseTerrain, "scale", {label: "Scale", min: 0, max: 4, step: 0.01});

    const fogOfWar = terrain.addFolder({title: "Fog of war"});
    fogOfWar.addBinding(state.renderer.fogOfWar, "scale", {label: "Scale", min: 0, max: 4, step: 0.01});

    const highlights = pane.addFolder({title: "Highlights"});
    const selectedTile = highlights.addFolder({title: "Selected tile"});
    selectedTile.addBinding(state.renderer.highlights.selectedTile, "color", {label: "Color", picker: "inline"});

    const availableTiles = highlights.addFolder({title: "Available tiles"});
    availableTiles.addBinding(state.renderer.highlights.availableTiles, "defaultColor", {label: "Default color", picker: "inline"});
    availableTiles.addBinding(state.renderer.highlights.availableTiles, "hoverColor", {label: "Hover color", picker: "inline"});

    const grid = pane.addFolder({title: "Tile grid"});
    grid.addBinding(state.renderer.grid, "color", {label: "Color", picker: "inline"});
    grid.addBinding(state.renderer.grid, "thickness", {label: "Thickness", min: 0, max: 1, step: 0.001});

    const colorGrading = pane.addFolder({title: "Color grading"});
    colorGrading.addBinding(state.renderer.colorGrading, "exposure", {label: "Exposure", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "temperature", {label: "Temperature", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "tint", {label: "Tint", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "brightness", {label: "Brightness", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "contrast", {label: "Contrast", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "blacks", {label: "Blacks", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "whites", {label: "Whites", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "shadows", {label: "Shadows", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "highlights", {label: "Highlights", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "vibrance", {label: "Vibrance", min: -1, max: 1, step: 0.01});
    colorGrading.addBinding(state.renderer.colorGrading, "saturation", {label: "Saturation", min: -1, max: 1, step: 0.01});

    pane.on("change", () => database.set(structuredClone(state)));

    return () => pane.dispose();
}
