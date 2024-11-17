interface TextureUnitInfo {
    unit: number,
    used: boolean,
    boundName: string | null
}

/**
 * Manages and optimizes the available texture units and texture binding.
 */
export class TextureBindingHandler {

    private readonly units: TextureUnitInfo[] = [];

    /**
     * @param maxAmountUnits the max amount of texture that can be bound at the same time
     */
    constructor(maxAmountUnits: number) {
        for (let i = 0; i < maxAmountUnits; i++) {
            this.units.push({
                unit: i,
                used: false,
                boundName: null,
            });
        }
    }

    /**
     * Request texture units for the textures with the given names
     * @param names the names of the texture.
     * @return {Map<name,unit>} the map of texture-name to assigned texture-unit. If the texture is already bound, it will not be contained in the map.
     */
    public requestUnits(names: string[]): Map<string, number> {
        const resultingUnits = new Map<string, number>();
        for (let name of names) {
            if (this.isBound(name)) {
                continue;
            }
            resultingUnits.set(name, this.requestUnit(name, names));
        }
        return resultingUnits;
    }

    /**
     * Request a texture-unit for the texture with the given name (no matter if already bound).
     * @param name the name of the texture
     * @param lockedNames the names of texture that may not be overwritten
     * @return number the assigned texture unit
     */
    public requestUnit(name: string, lockedNames: string[]): number {
        // find unit already used for name
        for (let unitInfo of this.units) {
            if (unitInfo.used && unitInfo.boundName === name) {
                console.log("Finding texture unit for " + name + ": using unit already used by name.", unitInfo)
                return unitInfo.unit;
            }
        }
        // find unused unit
        for (let unitInfo of this.units) {
            if (!unitInfo.used) {
                unitInfo.used = true;
                unitInfo.boundName = name;
                console.log("Finding texture unit for " + name + ": using unused unit.", unitInfo)
                return unitInfo.unit;
            }
        }
        // find used unit to overwrite
        for (let unitInfo of this.units) {
            if (unitInfo.used && lockedNames.indexOf(unitInfo.boundName ?? "") === -1) {
                unitInfo.used = true;
                unitInfo.boundName = name;
                console.log("Finding texture unit for " + name + ": overwriting unit.", unitInfo)
                return unitInfo.unit;
            }
        }
        throw new Error("No more free texture-units available");
    }

    /**
     * @param name the name of the texture
     * @return boolean whether the texture with the given name is already bound.
     */
    public isBound(name: string): boolean {
        return this.units.some(unitInfo => unitInfo.used && unitInfo.boundName === name);
    }

    /**
     * @param name the name of the texture
     * @return {number | null} the current unit of the texture or null if not bound
     */
    public getUnit(name: string): number | null {
        for (let unitInfo of this.units) {
            if (unitInfo.used && unitInfo.boundName == name) {
                return unitInfo.unit;
            }
        }
        return null;
    }

}