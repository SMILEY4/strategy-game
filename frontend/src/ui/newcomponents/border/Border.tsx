import "./border.less"

export interface BorderProps {
    children?: any;
}

export function Border(props: BorderProps) {
    return (
        <div className="new-border border__outer">
            <div className="border__inner">
                {props.children}
            </div>
        </div>
    );
}