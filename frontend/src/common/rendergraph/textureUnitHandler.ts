// noinspection PointlessBooleanExpressionJS
export class TextureUnitHandler {

	private readonly textureUnitSlots: TextureUnitSlot[] = [];

	constructor(maxTextureUnits: number) {
		for (let i = 0; i < maxTextureUnits; i++) {
			this.textureUnitSlots.push({
				textureUnit: i,
				usedBy: null,
			});
		}
	}

	public findTextureUnit(textureId: string, lockedTextureIds: string[]): number {
		let slot: TextureUnitSlot | null = null;
		if (slot == null) {
			slot = this.findUsedById(textureId);
		}
		if (slot == null) {
			slot = this.findUnused();
		}
		if (slot == null) {
			slot = this.findUsedForOverwriting(lockedTextureIds);
		}
		if (slot == null) {
			throw new Error("Could not find texture unit for texture '" + textureId + "'");
		}
		slot.usedBy = textureId;
		return slot.textureUnit;
	}

	private findUsedById(textureId: string): TextureUnitSlot | null {
		for (let slot of this.textureUnitSlots) {
			if (slot.usedBy === textureId) {
				return slot;
			}
		}
		return null;
	}

	private findUnused(): TextureUnitSlot | null {
		for (let slot of this.textureUnitSlots) {
			if (slot.usedBy == null) {
				return slot;
			}
		}
		return null;
	}

	private findUsedForOverwriting(lockedTextureIds: string[]): TextureUnitSlot | null {
		for (let slot of this.textureUnitSlots) {
			const isLocked = slot.usedBy == null || lockedTextureIds.includes(slot.usedBy);
			if (!isLocked) {
				return slot;
			}
		}
		return null;
	}

}


interface TextureUnitSlot {
	textureUnit: number,
	usedBy: string | null,
}