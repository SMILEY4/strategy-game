import React, {ReactElement} from "react";
import {Circle, Rect, Transformer} from "react-konva";
import Konva from "konva";

export interface AtlasEntryData {
	id: string,
	name: string,
	x: number,
	y: number,
	baseY: number,
	width: number,
	height: number,
}


export function AtlasEntry(props: { data: AtlasEntryData, isSelected: boolean, onSelect: () => void, onChange: (newData: AtlasEntryData) => void }): ReactElement
{
	const shapeRef = React.useRef<Konva.Rect>();
	const trRef = React.useRef<Konva.Transformer>();

	React.useEffect(() => {
		if (props.isSelected) {
			trRef.current!!.nodes([shapeRef.current!!]);
			trRef.current!!.getLayer()!!.batchDraw();
		}
	}, [props.isSelected]);

	return (
		<React.Fragment>
			<Rect
				x={props.data.x}
				y={props.data.y + (props.data.height - props.data.baseY)}
				width={props.data.width}
				height={2}
				fill={"blue"}
			/>
			<Rect
				onDblClick={(e: any) => {
					const stage = e.target.getStage();
					const oldScale = stage.scaleX();
					const mousePointTo = {
						x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
						y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
					};
					props.onChange({
						...props.data,
						baseY: props.data.height - (mousePointTo.y - props.data.y)
					});
				}}
				onClick={props.onSelect}
				onTap={props.onSelect}
				ref={shapeRef as any}
				x={props.data.x}
				y={props.data.y}
				width={props.data.width}
				height={props.data.height}
				fill={"blue"}
				opacity={0.2}
				draggable={props.isSelected}
				onDragEnd={(e) => {
					props.onChange({
						...props.data,
						x: e.target.x(),
						y: e.target.y(),
					});
				}}
				onTransformEnd={(e) => {
					const node = shapeRef.current!!;
					const scaleX = node.scaleX();
					const scaleY = node.scaleY();
					node.scaleX(1);
					node.scaleY(1);
					props.onChange({
						...props.data,
						x: node.x(),
						y: node.y(),
						width: node.width() * scaleX,
						height: node.height() * scaleY,
					});
				}}
			/>
			{props.isSelected && (
				<Transformer
					ref={trRef as any}
					flipEnabled={false}
				/>
			)}
		</React.Fragment>
	);
};