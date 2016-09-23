import Particle from "./Particle";

// 出現させる風の粒子の個数
const particle_count = 2000;

class ParticleManager {
    constructor(wind, canvas, projecton) {
        this.wind = wind;
        this.cvs = canvas;
        this.ctx = this.cvs.getContext("2d");
        this.proj = projecton
        this.particles = [];

        // 粒子を発生させる
        for(let i = 0; i < particle_count; i ++) {
            this.particles.push(new Particle());
        }

        // ブラウザアニメーション更新
        requestAnimationFrame(this._process.bind(this));
    }

    // 各フレームごとに呼び出される関数
    _process() {
        this.particles.forEach((p) => {
            // 粒子を移動させる
            p.move(this.wind);
        })

        this._render();
        requestAnimationFrame(this._process.bind(this));
    }

    // 描画関数
    _render() {
        this.particles.forEach((p) => {
            // 粒子の色 (気温差により青と赤)
            if (p.tmp > p.prevtmp) {
                this.ctx.fillStyle = "blue";
            } else {
                this.ctx.fillStyle = "red";            
            }
            // d3 GeoマッピングののProjectionにて緯度経度をブラウザ座標に変換
            const z = this.proj([p.lon, p.lat]);
            // 粒子を円で描く
            this.ctx.beginPath();
            this.ctx.arc(z[0], z[1], 1,  0, Math.PI * 2, true);
            this.ctx.fill();
        })

        // この処理で現在、書かれている全ピクセルにアルファ0.95で塗りつぶす
        // これにより粒子の移動軌跡が時間経過とともに薄くなり尾を引くように見える
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
        var prev = this.ctx.globalCompositeOperation;
        this.ctx.globalCompositeOperation = "destination-in";
        this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height);
        this.ctx.globalCompositeOperation = prev;        
    }
}

export default ParticleManager;