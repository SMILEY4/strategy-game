import {Pane, type FolderApi} from "tweakpane";
import {DI} from "@app/app.ts";
import type {DebugColor, DebugData} from "@app/features/game/database/debug.database.ts";

type PaneState = {
    renderer: DebugData["renderer"],
    colors: {
        selectedTile: string,
        availableDefault: string,
        availableHover: string,
        grid: string,
    },
};

const numberOptions = {
    scale: {min: 0, max: 4, step: 0.01},
    amplitude: {min: 0, max: 1, step: 0.01},
    thickness: {min: 0, max: 1, step: 0.001},
    grading: {min: -1, max: 1, step: 0.01},
};

function colorToHex(color: DebugColor): string {
    return "#" + color.slice(0, 3)
        .map(channel => Math.round(channel * 255).toString(16).padStart(2, "0"))
        .join("");
}

function hexToColor(hex: string, alpha: number): DebugColor {
    const value = hex.replace("#", "");
    return [
        parseInt(value.slice(0, 2), 16) / 255,
        parseInt(value.slice(2, 4), 16) / 255,
        parseInt(value.slice(4, 6), 16) / 255,
        alpha,
    ];
}

function labelFor(key: string): string {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, character => character.toUpperCase());
}

function syncObject(target: Record<string, any>, source: Record<string, any>): void {
    for (const [key, value] of Object.entries(source)) {
        if (value && typeof value === "object" && !Array.isArray(value)) {
            syncObject(target[key], value);
        } else {
            target[key] = structuredClone(value);
        }
    }
}

function createPaneState(debugData: DebugData): PaneState {
    const renderer = structuredClone(debugData.renderer);
    return {
        renderer: renderer,
        colors: {
            selectedTile: colorToHex(renderer.highlights.selectedTile.color),
            availableDefault: colorToHex(renderer.highlights.availableTiles.defaultColor),
            availableHover: colorToHex(renderer.highlights.availableTiles.hoverColor),
            grid: colorToHex(renderer.grid.color),
        },
    };
}

function toDebugData(state: PaneState): DebugData {
    const renderer = structuredClone(state.renderer);
    renderer.highlights.selectedTile.color = hexToColor(
        state.colors.selectedTile,
        renderer.highlights.selectedTile.color[3],
    );
    renderer.highlights.availableTiles.defaultColor = hexToColor(
        state.colors.availableDefault,
        renderer.highlights.availableTiles.defaultColor[3],
    );
    renderer.highlights.availableTiles.hoverColor = hexToColor(
        state.colors.availableHover,
        renderer.highlights.availableTiles.hoverColor[3],
    );
    renderer.grid.color = hexToColor(state.colors.grid, renderer.grid.color[3]);
    return {renderer};
}

function addNumberBinding(folder: FolderApi, object: object, key: string, options: object): void {
    folder.addBinding(object as any, key as any, {
        ...options,
        label: labelFor(key),
    } as any);
}

function addRendererBindings(pane: Pane, state: PaneState): void {
    const renderer = state.renderer;

    const geometry = pane.addFolder({title: "Geometry"});
    addNumberBinding(geometry, renderer, "randomHexOffsetScale", numberOptions.scale);

    const terrain = pane.addFolder({title: "Terrain"});
    const landMask = terrain.addFolder({title: "Land mask"});
    addNumberBinding(landMask, renderer.landMask, "noise1Scale", numberOptions.scale);
    addNumberBinding(landMask, renderer.landMask, "noise1Amplitude", numberOptions.amplitude);
    addNumberBinding(landMask, renderer.landMask, "noise2Scale", numberOptions.scale);
    addNumberBinding(landMask, renderer.landMask, "noise2Amplitude", numberOptions.amplitude);

    const baseTerrain = terrain.addFolder({title: "Base terrain"});
    addNumberBinding(baseTerrain, renderer.baseTerrain, "scale", numberOptions.scale);

    const fogOfWar = terrain.addFolder({title: "Fog of war"});
    addNumberBinding(fogOfWar, renderer.fogOfWar, "scale", numberOptions.scale);

    const highlights = pane.addFolder({title: "Highlights"});
    const selectedTile = highlights.addFolder({title: "Selected tile"});
    selectedTile.addBinding(state.colors, "selectedTile", {label: "Color", picker: "inline"});

    const availableTiles = highlights.addFolder({title: "Available tiles"});
    availableTiles.addBinding(state.colors, "availableDefault", {label: "Default color", picker: "inline"});
    availableTiles.addBinding(state.colors, "availableHover", {label: "Hover color", picker: "inline"});

    const grid = pane.addFolder({title: "Tile grid"});
    grid.addBinding(state.colors, "grid", {label: "Color", picker: "inline"});
    addNumberBinding(grid, renderer.grid, "thickness", numberOptions.thickness);

    const colorGrading = pane.addFolder({title: "Color grading"});
    for (const key of Object.keys(renderer.colorGrading) as Array<keyof typeof renderer.colorGrading>) {
        addNumberBinding(colorGrading, renderer.colorGrading, key, numberOptions.grading);
    }
}

export function createDebugPane(container: HTMLElement, onClose: () => void): () => void {
    const database = DI.debugDatabase;
    const state = createPaneState(database.get());
    const pane = new Pane({
        container,
        document: container.ownerDocument,
        title: "Developer UI",
    });

    pane.element.style.width = "100%";
    pane.element.style.height = "100%";
    addRendererBindings(pane, state);
    pane.addButton({title: "Close"}).on("click", onClose);

    pane.on("change", () => database.set(toDebugData(state)));
    const databaseSubscription = database.subscribe(debugData => {
        syncObject(state.renderer, debugData.renderer);
        state.colors.selectedTile = colorToHex(debugData.renderer.highlights.selectedTile.color);
        state.colors.availableDefault = colorToHex(debugData.renderer.highlights.availableTiles.defaultColor);
        state.colors.availableHover = colorToHex(debugData.renderer.highlights.availableTiles.hoverColor);
        state.colors.grid = colorToHex(debugData.renderer.grid.color);
        pane.refresh();
    });

    let disposed = false;
    return () => {
        if (disposed) return;
        disposed = true;
        database.unsubscribe(databaseSubscription);
        pane.dispose();
    };
}
