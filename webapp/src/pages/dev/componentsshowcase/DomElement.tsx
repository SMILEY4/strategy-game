import {useEffect, useRef} from "react";

export function DomElement<P extends object>(props: { create: (props: P) => HTMLElement; props: P; }) {

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const el = props.create(props.props);
        container.appendChild(el);

        return () => {
            container.removeChild(el);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.create, JSON.stringify(props)]);

    return <div className="dom-element-wrapper" ref={containerRef}/>;
}