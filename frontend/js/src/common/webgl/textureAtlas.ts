export class TextureAtlas {

	private readonly entries: Map<string, TextureAtlasEntry>;
	private readonly groups: Map<string, TextureAtlasEntry[]>;
	private readonly groupsDefinitions: TextureAtlasGroupDefinition[];

	constructor(data: Map<string, TextureAtlasEntry>, groupsDefinitions: TextureAtlasGroupDefinition[]) {
		this.groupsDefinitions = groupsDefinitions;
		this.entries = new Map<string, TextureAtlasEntry>();
		this.groups = new Map<string, TextureAtlasEntry[]>();
		this.setData(data);
	}

	public getEntry(name: string): TextureAtlasEntry {
		const entry = this.entries.get(name);
		if (entry) {
			return entry;
		} else {
			throw new Error("Could not find texture atlas entry for name '" + name + "'");
		}
	}

	public getEntryOrNull(name: string): TextureAtlasEntry | null {
		const entry = this.entries.get(name);
		return entry ? entry : null;
	}

	public getEntryNames(): string[] {
		return Array.from(this.entries.keys());
	}

	public getGroup(name: string): TextureAtlasEntry[] {
		const group = this.groups.get(name);
		if (group) {
			return group;
		} else {
			throw new Error("Could not find texture atlas entry group for name '" + name + "'");
		}
	}


	public getGroupOrNull(name: string): TextureAtlasEntry[] | null {
		const group = this.groups.get(name);
		return group ? group : null;
	}

	public getGroupNames(): string[] {
		return Array.from(this.groups.keys());
	}

	public setData(entries: Map<string, TextureAtlasEntry>) {
		// reset
		this.entries.clear();
		this.groups.clear();
		// add entries
		entries.forEach((value, key) => this.entries.set(key, value));
		// build groups
		const arrayEntries = Array.from(this.entries.values());
		this.groupsDefinitions.forEach(definition => {
			if (definition.entryNames) {
				this.groups.set(definition.name, arrayEntries.filter(it => definition.entryNames!.indexOf(it.name) !== -1));
			} else if (definition.entrySelector) {
				this.groups.set(definition.name, arrayEntries.filter(it => definition.entrySelector!(it.name)));
			}
		});
	}

}


export interface TextureAtlasEntry {
	name: string,
	vertices: ([number, number])[],
	textureCoordinates: ([number, number])[],
	offset: number,
	scale: number,
	mode: "billboard" | "ground"
}

export interface TextureAtlasGroupDefinition {
	name: string,
	entryNames?: string[] | undefined
	entrySelector?: ((entryName: string) => boolean) | undefined
}

export namespace TextureAtlas {

	/**
	 * @param entries the atlas data
	 * @param groupDefinitions definitions for texture atlas groups
	 */
	export function createFromData(entries: TextureAtlasEntry[], groupDefinitions: TextureAtlasGroupDefinition[]) {
		const data = new Map<string, TextureAtlasEntry>();
		entries.forEach(entry => data.set(entry.name, entry));
		return new TextureAtlas(data, groupDefinitions);
	}

}