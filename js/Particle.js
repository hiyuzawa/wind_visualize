import { LAT_GRIDS, LON_GRIDS, MIN_LAT, MAX_LAT, MIN_LON, MAX_LON, FORCAST_NUM } from "./WindDataManager";

// 風の粒子の生存期間MAX/MIN
const MAX_AGE = 500;
const MIN_AGE = 300;

const TOTAL_GRIDS = LAT_GRIDS * LON_GRIDS;
const LAT_GRIDS_SPAN = (MAX_LAT - MIN_LAT) / (LAT_GRIDS - 1);
const LON_GRIDS_SPAN = (MAX_LON - MIN_LON) / (LON_GRIDS - 1);

class Particle {

    constructor() {
        this._generate();
        this.reborn = false;
    }

    // 風の粒子の初期地点をエリア内にランダムに設定
    // 風の粒子の生存期間をランダムに設定
    // tmp: 現在地点の気温, prevtmp: 前回地点の気温
    _generate() {
        this.lat = Particle.rand(MAX_LAT, MIN_LAT);
        this.lon = Particle.rand(MAX_LON, MIN_LON);
        this.age = Particle.rand(MAX_AGE, MIN_AGE);
        this.tmp = 0.0;
        this.prevtmp = 0.0;
        
    }

    getStatus() {
        return `lat: ${this.lat}, lon: ${this.lon}, age: ${this.age}`;
    }

    move(w) {
        const prevLat = this.lat;
        const prevLon = this.lon;

        // 粒子を移動させる lat, lon, tmp(気温)
        // この0.003を変えると粒子の移動速度が変わる。0.003でいい感じになったということ以外に特に意味はない。
        this.lat = this.lat + 0.003 * this._calcWindPower(w, "v");
        this.lon = this.lon + 0.003 * this._calcWindPower(w, "u");
        this.prevtmp = this.tmp;
        this.tmp = this._calcWindPower(w, "t");

        // 緯度経度境界を超えたら粒子を再生成
        if(!(this.lat > MIN_LAT && this.lat < MAX_LAT)) {
            this.reborn = true;
        }
        if(!(this.lon > MIN_LON && this.lon < MAX_LON)) {
            this.reborn = true;
        }

        // 生存期間を超えたら粒子を再生成
        this.age -= 1.0;
        if (this.age < 0) {
            this.reborn = true;
        }

        // 滞留して移動の変化がなくなったら再生成。 0.000001という値もいい感じになったという以外に特に意味はない
        if (Math.pow(this.lat - prevLat, 2) + Math.pow(this.lon - prevLon, 2) < 0.000001) {
            this.reborn = true;
        }

        // 実際の再生成
        if(this.reborn) {
            this._generate();
            this.reborn = false;
        }
    }


    // 風気温のデータ配列とその時の粒子の緯度経度からその地点の風東西,風南北,気温の値を取得する
    // 任意の緯度経度の値を取得するにはその緯度経度が含まれる格子4隅の値から線形補間して求める
    // w: データ配列(UGRD,VGRD,TMPの格子データが1次元配列に連続して並んでる)
    // uvt: "u" or "v" or "t" の欲する値。格子点数(TOTAL_GRIDS)ずらせば欲する格子点のその種類のデータが取れる
    _calcWindPower(w, uvt) {
        const lat = this.lat;
        const lon = this.lon;

        // データ種別に応じてOFFSETだけ配列をずらす
        var offset = 0;
        if(uvt == "v") {
            offset = TOTAL_GRIDS;
        } else if (uvt == "t") {
            offset = TOTAL_GRIDS * 2;
        }

        // 粒子の現在の緯度経度よりそれが含まれる格子4隅の座標を求める
        var x = (lon - MIN_LON) / LON_GRIDS_SPAN;
        var y = (lat - MIN_LAT) / LAT_GRIDS_SPAN;
        var x1 = Math.floor(x);
        var y1 = Math.floor(y);
        var x2 = x1 + 1;
        var y2 = y1 + 1;

        // 格子内での距離
        var dx = x - x1;
        var dy = y - y1;

        // 4隅のデータを取得する
        var d1 = w[offset + y1 * LON_GRIDS + x1];
        var d2 = w[offset + y1 * LON_GRIDS + x2];
        var d3 = w[offset + y2 * LON_GRIDS + x1];
        var d4 = w[offset + y2 * LON_GRIDS + x2];

        // 線形補間
        var z1 = Particle.linear(dx, d1, d2);
        var z2 = Particle.linear(dx, d3, d4);
        var z3 = Particle.linear(dy, z1, z2);

        return z3; 
    }

    static rand(min, max) {
        return Math.random() * ((max + 1) - min) + min;
    }

    static linear(p, d1, d2) {
        return d1 * (1.0 - p) + d2 * p;        
    }
}

export default Particle;