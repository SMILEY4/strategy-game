export function ResourceLabel(props: { type: string }): HTMLElement {
    const outer = document.createElement("div");
    outer.className = "resource-label resource-label--" + props.type;
    return outer;
}
