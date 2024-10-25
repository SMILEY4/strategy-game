export interface DetailsLogEntry {
	id: string,
	data: DetailsLogValue[]
}

export interface DetailsLogValue {
	key: string,
	type: string
}

export interface BooleanDetailsLogValue extends DetailsLogValue{
	type: "boolean"
	value: boolean
}

export interface NumberDetailsLogValue extends DetailsLogValue{
	type: "number"
	value: number
}

export interface TextDetailsLogValue extends DetailsLogValue{
	type: "text"
	value: string
}

export interface TileDetailsLogValue extends DetailsLogValue{
	type: "tile"
	value: {
		id: string
		q: number,
		r: number,
	}
}

export interface BuildingDetailsLogValue extends DetailsLogValue{
	type: "building"
	value: string
}

export interface ResourcesDetailsLogValue extends DetailsLogValue{
	type: "resources"
	value: ({type: string, amount: number})[]
}

