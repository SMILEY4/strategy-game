import {Camera} from "../../../common/webgl/camera";

export interface ChangeProvider {
	initialize: () => void;
	prepareFrame: (camera: Camera) => void;
	hasChange: (key: string) => boolean;
}