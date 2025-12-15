import {openWindow} from "../../../../components/window/windowHooks";
import {WindowStore} from "../../../../components/window/windowStore";
import React from "react";
import {OutlinerWindow} from "./OutlinerWindow";
import {WindowGroup} from "../windowGroups";
import {UID} from "../../../../../common/uid";
import {WorldObjectOutline} from "../../../../../models/worldobject/worldObjectOutline";
import {RealmOutline} from "../../../../../models/realm/realmOutline";
import {UseRealmWindow} from "../realm/useRealmWindow";
import {UseWorldObjectWindow} from "../unit/useWorldObjectWindow";
import {CameraService} from "../../../../../app/game/camera/camera.service";
import {OutlinerStateAccess} from "../../../../../app/game/outliner/outliner.state-access";

export namespace UseOutlinerWindow {

	export function open() {
		const windowId = UID.generate();
		openWindow({
			id: windowId,
			groupId: WindowGroup.LEFT_SIDEBAR,
			anchor: WindowStore.ANCHOR_LEFT_SIDE,
			content: <OutlinerWindow windowId={windowId}/>,
		});
	}

	export interface Data {
		realms: {
			entries: RealmOutline[],
			open: (outline: RealmOutline) => void,
		}
		units: {
			entries: WorldObjectOutline[],
			open: (outline: WorldObjectOutline) => void,
			focusCamera: (outline: WorldObjectOutline) => void,
		},
		tileImprovements: {
			entries: WorldObjectOutline[],
			open: (outline: WorldObjectOutline) => void,
			focusCamera: (outline: WorldObjectOutline) => void,
		},
	}

	export function useData(): UseOutlinerWindow.Data {

		const realms = OutlinerStateAccess.useOutlinerRealms();
		const units = OutlinerStateAccess.useOutlinerUnits();
		const tileImprovements = OutlinerStateAccess.useOutlinerTileImprovements();

		return {
			realms: {
				entries: realms,
				open: (outline: RealmOutline) => UseRealmWindow.open(outline.id),
			},
			units: {
				entries: units,
				open: (outline: WorldObjectOutline) => UseWorldObjectWindow.open(outline.id),
				focusCamera: (outline: WorldObjectOutline) => CameraService.centerOnTile(outline.tile.position),
			},
			tileImprovements: {
				entries: tileImprovements,
				open: (outline: WorldObjectOutline) => UseWorldObjectWindow.open(outline.id),
				focusCamera: (outline: WorldObjectOutline) => CameraService.centerOnTile(outline.tile.position),
			},
		};
	}

}