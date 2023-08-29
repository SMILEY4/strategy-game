import {ProvinceData} from "../models/province/provinceData";
import {MockData} from "../pages/ingame/mockData";

export function useProvince(provinceId: string): ProvinceData {
    return MockData.getProvinceData(provinceId); // TODO
}