import "./block.less";

export interface BlockProps {

}

export function Block(props: BlockProps) {
    return (
        <div className="block">
            <div className="block__background"/>
            <div className="block__content">
                Block
            </div>
        </div>
    );
}