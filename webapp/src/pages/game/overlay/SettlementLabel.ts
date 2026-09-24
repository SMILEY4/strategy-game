export function SettlementLabel(props: { name: string, pending: boolean, color: string }): HTMLElement {

    const outer = document.createElement("div");
    outer.className = "settlement-label" + (props.pending ? " settlement-label--pending" : "");

    const inner = document.createElement("div");
    inner.className = "settlement-label__inner"
    inner.style.backgroundColor = props.color;
    outer.appendChild(inner);

    const title = document.createElement("div");
    title.className = "settlement-label__title"
    title.textContent = props.name;
    inner.appendChild(title);

    return outer;
}

export function TileImprovementLabel(props: { name: string, pending: boolean, color: string }): HTMLElement {

    const outer = document.createElement("div");
    outer.className = "tileimprovement-label" + (props.pending ? " tileimprovement-label--pending" : "");

    const inner = document.createElement("div");
    inner.className = "tileimprovement-label__inner"
    inner.style.backgroundColor = props.color;
    outer.appendChild(inner);

    const title = document.createElement("div");
    title.className = "tileimprovement-label__title"
    title.textContent = props.name;
    inner.appendChild(title);

    return outer;
}
