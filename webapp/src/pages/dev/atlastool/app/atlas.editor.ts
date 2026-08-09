import type {AtlasLayer, AtlasTool, Rect, Size, SpriteRegion, Viewport} from "@pages/dev/atlastool/app/atlas.types.ts";

export interface AtlasEditor<IsProjectLoaded extends boolean = true | false> {
    load: {
        open: (images: File[], projectJson: string | null) => Promise<void>,
        projectJson: (jsonContent: string) => void,
    },
    project: IsProjectLoaded extends true ? AtlasEditorProject : null
}

export interface AtlasEditorProject {
    atlasName: {
        value: string,
        set: (value: string) => void
    },
    images: {
        list: AtlasLayer[],
        activeId: string | null,
        active: AtlasLayer | null,
        size: Size,
        add: (files: File[]) => Promise<void>,
        remove: (id: string) => void,
        select: (id: string) => void,
        cycle: (direction: 1 | -1) => void,
    },
    sprites: {
        list: SpriteRegion[],
        selectedId: string | null,
        selected: SpriteRegion | null,
        create: (region: Rect) => void,
        updateRegion: (id: string, patch: Partial<Rect>) => void,
        updateMeta: (id: string, patch: { name: string }) => void,
        select: (id: string | null) => void,
        delete: (id: string) => void,
        toggleLock: (id: string) => void,
        addAnnotation: (id: string, key: string) => void, // todo: remove key and inline nextKey-logic
        updateAnnotationKey: (id: string, key: string, newKey: string) => void,
        updateAnnotationValue: (id: string, key: string, newValue: string) => void,
        removeAnnotation: (id: string, key: string) => void,
    },
    tool: {
        available: ({ id: AtlasTool, displayName: string })[],
        active: AtlasTool,
        select: (tool: AtlasTool) => void
    }
    viewport: {
        value: Viewport,
        set: (value: Partial<Viewport>) => void,
    }
    export: {
        projectJson: () => void
    },
}