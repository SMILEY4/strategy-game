import {Pane} from "tweakpane";
import {DI} from "@app/app.ts";

export function createDebugPane(container: HTMLElement): () => void {
    const database = DI.developerSettingsDatabase;
    const state = structuredClone(database.get());
    const pane = new Pane({container, document: container.ownerDocument, title: "Developer UI"});

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
    geometry.addBinding(state.renderer.geometry, "hexOffsetScale", {label: "Hex offset scale", min: 0, max: 4, step: 0.01});

    const landMask = terrain.addFolder({title: "Land mask"});
    landMask.addBinding(state.renderer.terrain.landMask, "noise1Scale", {label: "Noise 1 scale", min: 0, max: 4, step: 0.01});
    landMask.addBinding(state.renderer.terrain.landMask, "noise1Amplitude", {label: "Noise 1 amplitude", min: 0, max: 1, step: 0.01});
    landMask.addBinding(state.renderer.terrain.landMask, "noise2Scale", {label: "Noise 2 scale", min: 0, max: 4, step: 0.01});
    landMask.addBinding(state.renderer.terrain.landMask, "noise2Amplitude", {label: "Noise 2 amplitude", min: 0, max: 1, step: 0.01});

    const base = terrain.addFolder({title: "Base terrain"});
    base.addBinding(state.renderer.terrain.base, "scale", {label: "Scale", min: 0, max: 4, step: 0.01});
    base.addBinding(state.renderer.terrain.base, "landLightColor", {label: "Land light", picker: "inline"});
    base.addBinding(state.renderer.terrain.base, "landDarkColor", {label: "Land dark", picker: "inline"});
    base.addBinding(state.renderer.terrain.base, "waterLightColor", {label: "Water light", picker: "inline"});
    base.addBinding(state.renderer.terrain.base, "waterDarkColor", {label: "Water dark", picker: "inline"});

    const coastline = terrain.addFolder({title: "Coastline"});
    coastline.addBinding(state.renderer.terrain.coastline, "edgeSoftness", {label: "Edge softness", min: 0, max: 1, step: 0.01});
    coastline.addBinding(state.renderer.terrain.coastline, "edgeThreshold", {label: "Edge threshold", min: 0, max: 1, step: 0.01});

    const fog = pane.addFolder({title: "Fog of war"});
    fog.addBinding(state.renderer.fogOfWar, "tileScale", {label: "Tile scale", min: 0, max: 4, step: 0.01});
    fog.addBinding(state.renderer.fogOfWar, "discoveredOpacity", {label: "Discovered opacity", min: 0, max: 1, step: 0.01});

    const highlights = pane.addFolder({title: "Tile highlights"});
    const selected = highlights.addFolder({title: "Selected"});
    selected.addBinding(state.renderer.tileHighlights.selected, "color", {label: "Color", picker: "inline"});
    selected.addBinding(state.renderer.tileHighlights.selected, "scale", {label: "Scale", min: 0, max: 2, step: 0.01});
    selected.addBinding(state.renderer.tileHighlights.selected, "height", {label: "Height", min: 0, max: 10, step: 0.01});
    selected.addBinding(state.renderer.tileHighlights.selected, "sideOpacity", {label: "Side opacity", min: 0, max: 1, step: 0.01});

    const available = highlights.addFolder({title: "Available"});
    available.addBinding(state.renderer.tileHighlights.available, "color", {label: "Color", picker: "inline"});
    available.addBinding(state.renderer.tileHighlights.available, "hoverColor", {label: "Hover color", picker: "inline"});

    const grid = pane.addFolder({title: "Tile grid"});
    grid.addBinding(state.renderer.tileGrid, "color", {label: "Color", picker: "inline"});
    grid.addBinding(state.renderer.tileGrid, "thickness", {label: "Thickness", min: 0, max: 1, step: 0.001});
    grid.addBinding(state.renderer.tileGrid, "fadeDistance", {label: "Fade distance", min: 0, max: 20, step: 0.1});

    const overlays = pane.addFolder({title: "Overlays"});
    const fill = overlays.addFolder({title: "Fill"});
    fill.addBinding(state.renderer.overlays.fill, "noiseScale", {label: "Noise scale", min: 0, max: 4, step: 0.01});
    fill.addBinding(state.renderer.overlays.fill, "noiseStrength", {label: "Noise strength", min: 0, max: 1, step: 0.01});
    fill.addBinding(state.renderer.overlays.fill, "dashCount", {label: "Dash count", min: 1, max: 20, step: 1});

    const border = overlays.addFolder({title: "Border"});
    border.addBinding(state.renderer.overlays.border, "dashCount", {label: "Dash count", min: 1, max: 20, step: 1});
    border.addBinding(state.renderer.overlays.border, "backOpacity", {label: "Back opacity", min: 0, max: 1, step: 0.01});

    const route = overlays.addFolder({title: "Route"});
    route.addBinding(state.renderer.overlays.route, "color", {label: "Color", picker: "inline"});
    route.addBinding(state.renderer.overlays.route, "opacity", {label: "Opacity", min: 0, max: 1, step: 0.01});

    const colorGrading = pane.addFolder({title: "Color grading"});
    colorGrading.addBinding(state.renderer.colorGrading, "exposure", {label: "Exposure", min: -4, max: 4, step: 0.01});
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
