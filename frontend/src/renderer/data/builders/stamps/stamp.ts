export interface Stamp {
    type: "icon" | "text"
    content: string, // either the url of the image or the text
    screenX: number,
    screenY: number,
}