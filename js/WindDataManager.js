// 風のデータを読み込むモジュール

// 風のデータ
const wind_data = "./data/wind.ieee";

// データの緯度経度の両端値
export const MAX_LAT = 47.6;
export const MIN_LAT = 22.4;
export const MAX_LON = 150.0;
export const MIN_LON = 120.0;

// 格子点数
export const LAT_GRIDS = 253;
export const LON_GRIDS = 241;

class WindDataManager {
    constructor() {

    }

    // データのロード完了後にcallbackが呼ばれる
    loadData(cb) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", wind_data, true);
        xhr.responseType = "arraybuffer";
        xhr.addEventListener("load", (e) => {
            const buffer = xhr.response;

            // 風のデータは32bit Float値の連続データ
            // それをfloatに戻して1次元配列に格納する
            const dataView = new DataView(buffer);
            this.wind = new Float32Array(buffer.byteLength / 4);
            for (let i = 0, len = this.wind.length; i < len; i++) {
                this.wind[i] = dataView.getFloat32(i * 4);
            }
            cb();
        });
        xhr.send();
    }

}

export default WindDataManager;