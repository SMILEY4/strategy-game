export function SettlementLabel(props: { name: string, pending: boolean }): HTMLElement {

    const outer = document.createElement("div");
    outer.className = "settlement-label" + (props.pending ? " settlement-label--pending" : "");

    const inner = document.createElement("div");
    inner.className = "settlement-label__inner"
    outer.appendChild(inner);

    const title = document.createElement("div");
    title.className = "settlement-label__title"
    title.textContent = props.name;
    inner.appendChild(title);

    return outer;
}