import MapJp from "./MapJp";
import WindDataManager from "./WindDataManager";
import ParticleManager from "./ParticleManager";

(function(){
    //　日本地図の描画    
    const mapJp = new MapJp(window.innerWidth, window.innerHeight);

    // 風のデータをXHRで読み込む。読み込み完了後に描画開始
    const windDataManager = new WindDataManager();
    windDataManager.loadData(()=>{
        console.log("wind data loaded");
        const particleManager = new ParticleManager(
                                        windDataManager.wind,
                                        mapJp.getCanvas(),
                                        mapJp.projection
                                        );
    });
})();