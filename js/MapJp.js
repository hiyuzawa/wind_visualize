import d3 from "d3";
import topojson from "topojson";

// topo.json ファイルのパス
const japan_topojson = "./data/map_topo.json";

class MapJp {

    constructor(width, height, elm = "body") {
        this.canvas  = d3.select(elm).append("canvas")
                        .attr("width", width)
                        .attr("height", height);
        //
        // scale の 2.0の値を変更すことで描画する地図の拡縮が変わります
        // rotateの [225,-36] の値を変更することで中心位置が変わります
        //
        this.projection = d3.geo.orthographic()                            
                            .scale(width * 2.0)
                            .translate([width / 2, height / 2])
                            .clipAngle(90)
                            .rotate([225, -36]);
                            
        this.path = d3.geo.path().projection(this.projection);
        this.svg = d3.select(elm).append("svg")
                    .attr("width", width)
                    .attr("height", height);

        // 背景(海) css の .sea でデザイン変更可 
        this.svg.append("rect").attr({"width": "100%", "height": "100%", "class": "sea"});

        this._drawGraticule();
        this._drawJapan();
    }

    // これは風の描画にあとで必要
    getCanvas() {
        return this.canvas.node();
    }

    // 緯度経度線の描画 
    // css の .graticule でデザインの変更可
    _drawGraticule() {
        const graticule = d3.geo.graticule().step([5, 5]);
        this.svg.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", this.path);
    }

    // 地図を実際に描画する部分
    // css の .contries で変更可
    _drawJapan() {
        d3.json(japan_topojson, (error, dat) => {
            const shape = this.svg.append("g");
            shape.selectAll(".contries")
            .data(topojson.feature(dat, dat.objects.map_geo).features)
                .enter()
                .append("path").attr("d", this.path)
                .attr("class", "country");
        })
    }
}

export default MapJp;