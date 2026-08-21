/** Reads a file as a data URL (used to load the sprite sheet image). */
export function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
    })
}

/** Reads a file as plain text (used to load project JSON). */
export function readFileAsText(file: File): Promise<string> {
    return file.text();
}

/** Decodes a data URL into a loadable image element. */
export function createImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Could not load image"));
        image.src = dataUrl;
    });
}

/** Triggers a browser download of the given json-content under the given filename. */
export function downloadJson(filename: string, content: string) {
    const blob = new Blob([content], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Whether the file looks like a supported raster image. */
export function isImageFile(file: File): boolean {
    return file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name);
}

/** Whether the file is a JSON project file. */
export function isJsonFile(file: File): boolean {
    return file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
}

/** Returns a file name without its final extension, e.g. `albedo.png` -> `albedo`. */
export function fileNameWithoutExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf(".");
    const base = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
    return base.trim() || "layer";
}
