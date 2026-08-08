/** I/O helpers for loading files/images and downloading the exported JSON. */

/** Reads a file as a data URL (used to load the sprite sheet image). */
export function readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Could not read file"));
        reader.readAsDataURL(file);
    });
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

/** Triggers a browser download of the given text under the given filename. */
export function downloadText(filename: string, text: string) {
    const blob = new Blob([text], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}
