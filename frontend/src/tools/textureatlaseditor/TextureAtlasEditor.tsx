import React, {ReactElement, useEffect, useRef, useState} from "react";
import {FastLayer, Image, Layer, Stage} from "react-konva";
import useImage from "use-image";
import "./textureatlaseditor.less";
import {AtlasEntry, AtlasEntryData} from "./AtlasEntry";
import {UID} from "../../common/uid";
import Konva from "konva";

export function TextureAtlasEditor(): ReactElement {

	const [stage, setStage] = useState({
		scale: 1,
		x: 0,
		y: 0,
	});

	function onWheel(e: any) {
		e.evt.preventDefault();
		const scaleBy = 1.1;
		const stage = e.target.getStage();
		const oldScale = stage.scaleX();
		const mousePointTo = {
			x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
			y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
		};
		const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
		setStage({
			scale: newScale,
			x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
			y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
		});
	}

	const refLoadImageInput = useRef<HTMLInputElement>(null);
	const refLoadDataInput = useRef<HTMLInputElement>(null);

	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [image] = useImage(imageUrl ?? "");

	const [entries, setEntries] = useState<AtlasEntryData[]>([]);
	const [selectedId, setSelected] = useState<string | null>(null);

	useEffect(() => {
	}, []);

	function checkDeselect(e: any) {
		const targetName = e.target.constructor.name;
		if (targetName === "Stage2" || targetName === "_Image") {
			setSelected(null);
		}
	}

	return (
		<div className="texture-atlas-editor">

			<input ref={refLoadImageInput} placeholder="Image Url..."/>
			<button onClick={() => {
				setImageUrl(refLoadImageInput.current!!.value)
			}}>
				Load Image
			</button>

			<input ref={refLoadDataInput} placeholder="JSON data..."/>
			<button onClick={() => {
				setEntries(loadFromClipboard(refLoadDataInput.current!!.value, image?.width ?? 1, image?.height ?? 1));
			}}>
				Load Data
			</button>

			<button onClick={() => copyToClipboard(entries, image?.width ?? 1, image?.height ?? 1)}>Copy to Clipboard</button>

			<button onClick={() => {
				const id = UID.generate();
				setEntries([...entries, {
					id: id,
					name: "noname",
					x: -100,
					y: -100,
					baseY: 0,
					width: 200,
					height: 200,
				}]);
				setSelected(id);
			}}>
				Add new
			</button>

			<button onClick={() => {
				if (selectedId != null) {
					const selected = entries.find(it => it.id === selectedId)!!;
					const id = UID.generate();
					setEntries([...entries, {
						...selected,
						id: id,
					}]);
					setSelected(id);
				}
			}}>
				Clone
			</button>

			<button onClick={() => {
				if (selectedId != null) {
					setEntries(entries.filter(it => it.id != selectedId));
					setSelected(null);
				}
			}}>
				Delete Selected
			</button>

			<input placeholder="name" value={entries.find(it => it.id === selectedId)?.name ?? ""} onChange={e => {
				setEntries(entries.map(it => {
					if (it.id === selectedId) {
						return {
							...it,
							name: e.target.value,
						};
					}
					return it;
				}));
			}}/>

			<Stage
				className="stage"
				width={window.innerWidth}
				height={window.innerHeight}
				scaleX={stage.scale}
				scaleY={stage.scale}
				x={stage.x}
				y={stage.y}
				draggable={true}
				onWheel={onWheel}
				onMouseDown={checkDeselect}
			>
				<FastLayer>
					<Image image={image} stroke="black"/>
				</FastLayer>
				<Layer>
					{entries.map((entry, i) => (
						<AtlasEntry
							key={entry.id}
							data={entry}
							isSelected={selectedId === entry.id}
							onSelect={() => setSelected(entry.id)}
							onChange={(newData) => {
								const modified = entries.slice();
								modified[i] = newData;
								setEntries(modified);
							}}
						/>
					))}
				</Layer>
			</Stage>
		</div>
	);
}

function loadFromClipboard(str: string, totalWidth: number, totalHeight: number): AtlasEntryData[] {
	const data = JSON.parse(str)
	console.log("loading atlas data", data)
	return data.map((entry: any) => {
		return {
			id: UID.generate(),
			name: entry.name,
			x: entry.textureCoordinates[0][0] * totalWidth,
			y: entry.textureCoordinates[0][1] * totalHeight,
			width: (entry.textureCoordinates[2][0] * totalWidth) - (entry.textureCoordinates[0][0] * totalWidth),
			height: (entry.textureCoordinates[2][1] * totalHeight) - (entry.textureCoordinates[0][1] * totalHeight),
			baseY: entry.origin[1] * ((entry.textureCoordinates[2][1] * totalHeight) - (entry.textureCoordinates[0][1] * totalHeight))
		}
	})
}

function copyToClipboard(entries: AtlasEntryData[], totalWidth: number, totalHeight: number) {
	const data = entries.map(entry => {
		// noinspection PointlessArithmeticExpressionJS
		const u0 = entry.x / totalWidth
		const u1 = (entry.x + entry.width) / totalWidth;
		const v0 = entry.y / totalHeight
		const v1 = (entry.y + entry.height) / totalHeight;
		return {
			name: entry.name,
			origin: [0.5, entry.baseY / entry.height],
			vertices: [
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 0],
				[1, 1],
				[0, 1],
			],
			textureCoordinates: [
				[u0, v0],
				[u1, v0],
				[u1, v1],
				[u0, v0],
				[u1, v1],
				[u0, v1],
			],
		};
	});
	console.log("saving atlas data", data)
	const jsonData = JSON.stringify(data, null, "   ");
	navigator.clipboard.writeText(jsonData).then(_ => undefined);
}