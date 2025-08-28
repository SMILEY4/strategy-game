export class WasmDataViewWriter {

	dataView: DataView = null!;
	counter = 0;

	setDataView(dataView: DataView) {
		this.dataView = dataView;
		this.counter = 0;
	}

	pushUint8(value: number) {
		this.dataView.setUint8(this.counter, value);
		this.counter += 1;
	}

	pushInt32(value: number) {
		this.dataView.setInt32(this.counter, value, true);
		this.counter += 4;
	}

	pushFloat32(value: number) {
		this.dataView.setFloat32(this.counter, value, true);
		this.counter += 4;
	}

}