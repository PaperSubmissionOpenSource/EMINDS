import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js'
import { sliderBottom, sliderLeft } from 'd3-simple-slider'
import * as d3 from 'd3'
import $ from 'jquery'
import { bin, range } from 'd3'

export default {
    name: 'BehaviormodeView',
    components: {
    },
    props: {
    },
    computed: {
    },
    data() {
        return {
            data_group1: 'simulated_MHOT',
            data_group2: 'simulated_MHSW',
            stroke_color: "#D1B24D", //条状图点击之后behavior view会相应加深，这是点击之后高亮的颜色
            normal_color: '#2f3e46', //normal color
            boundingbox_color: '#d9d9d9', //外面的长方形框框是什么颜色
            distribution_color: '#C9CBD1',
            box_color: '#C9CBD1',
            median_color: '#404042',
            number_color: 'white', //展现百分比的背景是什么颜色
            slider_color: '#C9CBD1',
            background_color: 'white',
            worse_distribution_color: '#432818',
            active_k: 5,
            passive_k: 5,
            active_x: 30, //active的分布从哪里开始画
            active_y: 300,
            passive_x: 30,
            passive_y: 530,
            boxplot: 0,
            min_max_list: { "Fre(post)": [0, 20], "interval": [0, 14], "sought IS": [0, 3], "sought ES": [0, 3], "toxicity": [0, 1], "Time(response)": [1, 3], "received IS": [0, 3], "received ES": [0, 3], "Num(response)": [0, 3] },
            x_deviation: { "Fre(post)": 2, "interval": 7, "sought IS": 1, "sought ES": 2, "toxicity": 7, "Num(response)": -7, "Time(response)": 0, "received IS": 10, "received ES": 5 },
        }
    },
    watch: {
        data_group1: function () {
            const _this = this
            $('.clusterdistribution').remove()
            $('.depressiondistribution').remove()
            $('.progressionoverview').remove()
            $('.progressionstage').remove()
            $(".patternresult").remove()
            $(".pattern").remove()
            $(".path").remove()
            const svg = d3.select(".stageviewbody")
                .append("svg")
                .attr("width", 900)
                .attr("height", 280)
                .attr("class", "progressionstage")
            dataService.transmit_depression([_this.data_group1, _this.data_group2], (data) => {
                _this.drawDepressionDistribution(data)
            })
            dataService.transmit_k([_this.data_group1, _this.data_group2, _this.active_k, _this.passive_k], (data) => {
                _this.drawClusterDistribution(0, data[0], _this.active_x, _this.active_y)
                _this.drawClusterDistribution(1, data[1], _this.passive_x, _this.passive_y)
                dataService.transmit_segment([_this.data_group1, _this.data_group2], (msg) => {
                    pipeService.emitSegment(msg)
                })
                dataService.transmit_stage_summarization([_this.data_group1, _this.data_group2], (msg) => {
                    //console.log("transmit_stage_summarization", msg)
                    pipeService.emitStage([_this.active_k, _this.passive_k, msg])
                })
                dataService.transmit_pattern([_this.data_group1, _this.data_group2], (msg) => {
                    pipeService.emitPattern(msg)
                })
                dataService.transmit_path([_this.data_group1, _this.data_group2], (msg) => {
                    pipeService.emitPath(msg)
                })
            })
        },
        data_group2: function () {
            const _this = this
            $('.clusterdistribution').remove()
            $('.depressiondistribution').remove()
            $('.progressionoverview').remove()
            $('.progressionstage').remove()
            $(".patternresult").remove()
            $(".pattern").remove()
            $(".path").remove()
            const svg = d3.select(".stageviewbody")
                .append("svg")
                .attr("width", 900)
                .attr("height", 280)
                .attr("class", "progressionstage")
            dataService.transmit_depression([_this.data_group1, _this.data_group2], (data) => {
                _this.drawDepressionDistribution(data)
            })
            dataService.transmit_k([_this.data_group1, _this.data_group2, _this.active_k, _this.passive_k], (data) => {
                _this.drawClusterDistribution(0, data[0], _this.active_x, _this.active_y)
                _this.drawClusterDistribution(1, data[1], _this.passive_x, _this.passive_y)
                dataService.transmit_segment([_this.data_group1, _this.data_group2], (msg) => {
                    pipeService.emitSegment(msg)
                })
                dataService.transmit_stage_summarization([_this.data_group1, _this.data_group2], (msg) => {
                    //console.log("transmit_stage_summarization", msg)
                    pipeService.emitStage([_this.active_k, _this.passive_k, msg])
                })
                dataService.transmit_pattern([_this.data_group1, _this.data_group2], (msg) => {
                    pipeService.emitPattern(msg)
                })
                dataService.transmit_path([_this.data_group1, _this.data_group2], (msg) => {
                    pipeService.emitPath(msg)
                })
            })
        },
        boxplot: function () {
            const _this = this
            if (_this.boxplot == 1) {
                $(".boxplot").attr("fill", _this.distribution_color)
                $(".distribution.boxplot").attr("visibility", "visible")
            } else {
                $(".boxplot").attr("fill", _this.background_color)
                $(".distribution.boxplot").attr("visibility", "hidden")
            }
        },
        // active_k: function () {
        //     const _this = this
        //     $(".kvalue.0").text(_this.active_k)
        //     dataService.transmit_k([_this.data_group1, _this.data_group2, _this.active_k, _this.passive_k], (data) => {
        //         $(".distribution.content.0").remove()
        //         $(".distribution.boundingbox.0").remove()
        //         $(".distribution.axis").remove()
        //         //$(".passive.cluster.name").remove()
        //         $(".active.cluster.name").remove()
        //         _this.drawClusterDistribution(0, data[0], _this.active_x, _this.active_y)
        //         // dataService.transmit_segment("1", (msg) => {
        //         //     _this.pipeService.emitSegment(msg)
        //         // })
        //         // dataService.transmit_stage_summarization("1", (msg) => {
        //         //     _this.pipeService.emitStage([_this.active_k, _this.passive_k, msg])
        //         // })
        //     })
        // },
        // passive_k: function () {
        //     const _this = this
        //     //console.log("passive", _this.passive_k)
        //     $(".kvalue.1").text(_this.passive_k)
        //     dataService.transmit_k([_this.data_group1, _this.data_group2, _this.data_group1, _this.data_group2, _this.active_k, _this.passive_k], (data) => {
        //         $(".distribution.content.1").remove()
        //         $(".distribution.boundingbox.1").remove()
        //         $(".distribution.axis").remove()
        //         $(".passive.cluster.name").remove()
        //         //$(".active.cluster.name").remove()
        //         _this.drawClusterDistribution(1, data[1], _this.passive_x, _this.passive_y)
        //         // dataService.transmit_segment("1", (msg) => {
        //         //     _this.pipeService.emitSegment(msg)
        //         // })
        //         // dataService.transmit_stage_summarization("1", (msg) => {
        //         //     _this.pipeService.emitStage([_this.active_k, _this.passive_k, msg])
        //         // })
        //     })
        // },
    },
    mounted: function () {
        const _this = this
        _this.drawLegend()
        _this.drawKInput()
        pipeService.onDataset(function (data) {
            _this.data_group1 = data[0]
            _this.data_group2 = data[1]
        })
        dataService.transmit_depression([_this.data_group1, _this.data_group2], (data) => {
            _this.drawDepressionDistribution(data)
        })
        dataService.transmit_k([_this.data_group1, _this.data_group2, _this.active_k, _this.passive_k], (data) => {
            _this.drawClusterDistribution(0, data[0], _this.active_x, _this.active_y)
            _this.drawClusterDistribution(1, data[1], _this.passive_x, _this.passive_y)
            dataService.transmit_segment([_this.data_group1, _this.data_group2], (msg) => {
                pipeService.emitSegment(msg)
            })
            dataService.transmit_stage_summarization([_this.data_group1, _this.data_group2], (msg) => {
                //console.log("transmit_stage_summarization", msg)
                pipeService.emitStage([_this.active_k, _this.passive_k, msg])
            })
            dataService.transmit_pattern([_this.data_group1, _this.data_group2], (msg) => {
                pipeService.emitPattern(msg)
            })
            dataService.transmit_path([_this.data_group1, _this.data_group2], (msg) => {
                pipeService.emitPath(msg)
            })
        })
        $(".active." + _this.active_k).css("fill", "red")
        $(".passive." + _this.passive_k).css("fill", "red")
        pipeService.onAP(function (ap_list) {
            for (let i = 1; i < _this.active_k + 1; i++) {
                if (ap_list.includes(('a' + i))) {
                    $('.bg.a' + i).attr("visibility", "visable")
                } else {
                    $('.bg.a' + i).attr("visibility", "hidden")
                }

            }
            for (let i = 1; i < _this.passive_k + 1; i++) {
                if (ap_list.includes(('p' + i))) {
                    $('.bg.p' + i).attr("visibility", "visable")
                } else {
                    $('.bg.p' + i).attr("visibility", "hidden")
                }

            }
        })
    },
    methods: {
        drawLegend() {
            const _this = this
            const svg = d3.select(".behaviorviewheader")
                .append("svg")
                .attr("width", 110)
                .attr("height", 20)

            let g_legend = svg.append('g')

            g_legend.append("rect")
                .attr("x", 13)
                .attr("y", 3)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", _this.background_color)
                .attr("stroke", "black")
                .on("click", function () {
                    _this.boxplot = 1 - _this.boxplot
                })
                .attr("class", "boxplot")

            g_legend.append("text")
                .attr("x", 27)
                .attr("y", 12)
                .attr("font-size", 13)
                .text("boxplot")

            g_legend.append("circle")
                .attr("cx", 104)
                .attr("cy", 7)
                .attr("r", 5)
                .attr("fill", "white")
                .attr("stroke", "red")
                .on("mouseover", function() {
                    $(".prompt_1").attr("visibility", "visible"); 
                })
                .on("mouseout", function() {
                    $(".prompt_1").attr("visibility", "hidden");  
                });

            g_legend.append("text")
                .attr("x", 101)
                .attr("y", 10)
                .attr("font-size", 8)
                .text("?")
                .attr("fill", "#bc4b51")
                .on("mouseover", function() {
                    $(".prompt_1").attr("visibility", "visible"); 
                })
                .on("mouseout", function() {
                    $(".prompt_1").attr("visibility", "hidden");  
                });
        },
        getMaxOfArray(numArray) {
            return Math.max.apply(null, numArray);
        },
        getMinOfArray(numArray) {
            return Math.min.apply(null, numArray);
        },
        drawDepressionDistribution(data) {
            console.log(data)
            const _this = this
            const width = 270
            const height = 170
            const svg_depression = d3.select(".svg").append('g').attr("transform", "translate(0, 30)").attr("class", "depressiondistribution")

            const svg_title = d3.select(".svg").append('g').attr("class", "depressiondistribution")

            //显示一些提示
            let g_prompt = d3.select(".svg").append('g')
                .attr("width", 250)
                .attr("height", 80)
                .attr("class", "prompt_1")
                .attr("visibility", "hidden")
                .attr("transform", "translate(5, 40)")
            
            let rect = g_prompt.append('rect')
                .attr('width', 290)  
                .attr('height', 90)  
                .attr('fill', 'white')  
                .attr('stroke', 'black')
                .attr('x', 0)  
                .attr('y', 0);
            
            let text = g_prompt.append('text')
                .attr('x', 10) 
                .attr('y', 15) 
                .attr('fill', 'black')
                .attr('font-size', '12px')
            
            text.append('tspan')
                .text('The matrix design is used to display behavior types.')
                .attr('x', 10) 
                .attr('y', 30) 
            
            text.append('tspan')
                .text('Each row represents a behavior type (e.g., p1),')
                .attr('x', 10) 
                .attr('y', 45) 

            text.append('tspan')
                .text('which consists of multiple behavior variables')
                .attr('x', 10) 
                .attr('y', 60) 

            text.append('tspan')
                .text('with different values.')
                .attr('x', 10) 
                .attr('y', 75) 

            svg_title.append("text")
                .attr("x", 5)
                .attr("y", 20)
                .attr("font-size", 15)
                .text("depression")

            // 进行频率统计
            const freq1 = {};
            for (let i = 0; i < data[0].length; i++) {
                const key = data[0][i];
                freq1[key] = (freq1[key] || 0) + 1;
            }
            const freq2 = {};
            for (let i = 0; i < data[1].length; i++) {
                const key = data[1][i];
                freq2[key] = (freq2[key] || 0) + 1;
            }
            // 将频率统计结果转换为数组
            let dataArray1 = Object.entries(freq1).map(d => [+d[0], d[1]]);
            let dataArray2 = Object.entries(freq2).map(d => [+d[0], d[1]]);

            const bin = 0.3

            dataArray1.sort((a, b) => a[0] - b[0])
            dataArray2.sort((a, b) => a[0] - b[0])

            dataArray1 = dataArray1.reduce((acc, curr) => {
                const lastBin = acc.length > 0 ? acc[acc.length - 1][0] : null;
                if (lastBin !== null && curr[0] <= lastBin + bin) {
                    acc[acc.length - 1][1] += curr[1];
                } else {
                    acc.push([Math.floor(curr[0] / bin) * bin, curr[1]]);
                }
                return acc;
            }, []);

            dataArray2 = dataArray2.reduce((acc, curr) => {
                const lastBin = acc.length > 0 ? acc[acc.length - 1][0] : null;
                if (lastBin !== null && curr[0] <= lastBin + bin) {
                    acc[acc.length - 1][1] += curr[1];
                } else {
                    acc.push([Math.floor(curr[0] / bin) * bin, curr[1]]);
                }
                return acc;
            }, []);

            let x = d3.scaleLinear().domain([0.85, d3.max(dataArray1.length > dataArray2.length ? dataArray1 : dataArray2, d => d[0])]).range([20, width]);
            let y = d3.scaleLinear().domain([0, d3.max(dataArray1, d => d[1])]).range([height, 0]);

            let area1 = d3.area().x(d => x(d[0])).y0(height).y1(d => y(d[1])).curve(d3.curveBasis);
            let area2 = d3.area().x(d => x(d[0])).y0(height).y1(d => y(d[1])).curve(d3.curveBasis);

            // 绘制区域图
            svg_depression.append("defs")
                .append("pattern")
                .attr("id", "diagonal-stripe")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("width", 5)
                .attr("height", 5)
                .append("path")
                .attr("d", "M-1,1 l2,-2 M0,5 l5,-5 M9,11 l2,-2")
                .attr("stroke", _this.worse_distribution_color)
                .attr("stroke-width", 1)

            svg_depression.append("path")
                .datum(dataArray1)
                .attr("fill", _this.distribution_color)
                .attr("d", area1)
                .attr("opacity", 0.5)
                .attr("stroke", "black")

            svg_depression.append("path")
                .datum(dataArray2)
                .attr("fill", _this.distribution_color)
                .attr("d", area2)
                .attr("opacity", 0.5)
                .attr("stroke", "black")
                .attr("fill", "url(#diagonal-stripe)")


            // 绘制legend
            let svg_legend = svg_depression.append('g')
            svg_legend.append('rect')
                .attr("x", 230)
                .attr("y", 10)
                .attr("height", 10)
                .attr("width", 10)
                .attr("fill", _this.distribution_color)
                .attr("stroke", "black")
                .attr("opacity", 0.5)

            svg_legend.append('text')
                .attr("x", 245)
                .attr("y", 18)
                .attr("font-size", 12)
                .text("group1")

            svg_legend.append('rect')
                .attr("x", 230)
                .attr("y", 30)
                .attr("height", 10)
                .attr("width", 10)
                .attr("fill", "url(#diagonal-stripe)")

            svg_legend.append('rect')
                .attr("x", 230)
                .attr("y", 30)
                .attr("height", 10)
                .attr("width", 10)
                .attr("fill", _this.distribution_color)
                .attr("stroke", "black")
                .attr("opacity", 0.5)

            svg_legend.append('text')
                .attr("x", 245)
                .attr("y", 38)
                .attr("font-size", 12)
                .text("group2")
            let xt = 3
            svg_legend.append('rect')
                .attr("x", 241 - xt)
                .attr("y", 200)
                .attr("height", 10)
                .attr("width", 27)
                .attr("fill", 'none')
                .attr("stroke", "black")
                .attr("opacity", 0.5)

            svg_legend.append('rect')
                .attr("x", 254 - xt)
                .attr("y", 200)
                .attr("height", 10)
                .attr("width", 2)
                .attr("fill", 'black')
                .attr("stroke", "black")
                .attr("opacity", 0.4)

            svg_legend.append('text')
                .attr("x", 220 - xt)
                .attr("y", 210)
                .attr("font-size", 12)
                .text("low")

            svg_legend.append('text')
                .attr("x", 270 - xt)
                .attr("y", 210)
                .attr("font-size", 12)
                .text("high")

            var formatK = d3.format("d")

            // 添加 X 轴
            svg_depression.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).ticks(5));

            // 添加 Y 轴
            svg_depression.append("g").attr("transform", "translate(25, 0)")
                .call(d3.axisLeft(y).ticks(5).tickFormat(function (d) {
                    return formatK(d / 1000) + 'k'
                }))
        },
        drawEachBoxplot(flag, data, svg, y_start, y1, yheight, xscale, xwidth) {
            const _this = this
            // 数据格式为第n个类别，横坐标分布从x_start到x_end，然后画出里面每个attribute的分布
            // data表示这一个类别的所有数据
            let key = Object.keys(data[0])
            for (let t = 0; t < key.length; t++) {
                //写每一个attribute的名字
                if (flag == 0) {
                    svg.append("text")
                        .attr("x", xscale(t) + _this.x_deviation[key[t]])
                        .attr("y", y_start - 20)
                        .attr("font-size", 11)
                        .text(key[t])
                        .attr("opacity", 0.3)
                } else {
                    svg.append("text")
                        .attr("x", xscale(t) + _this.x_deviation[key[t]])
                        .attr("y", y_start - 20)
                        .attr("font-size", 10)
                        .text(key[t])
                        .attr("opacity", 0.3)
                }

                let height = yheight - 5
                let data_temp = data.map(obj => { return obj[key[t]] })

                //对于过大的值处理掉，设置一个上限
                for (let p = 0; p < data_temp.length; p++) {
                    if (data_temp[p] > _this.min_max_list[key[t]][1]) {
                        data_temp[p] = _this.min_max_list[key[t]][1]
                    }
                }

                var data_sorted = data_temp.sort(d3.ascending)
                var q1 = d3.quantile(data_sorted, .25)
                var median = d3.quantile(data_sorted, .5)
                var q3 = d3.quantile(data_sorted, .75)
                if (median == q1 || median == q3) {
                    median = (q1 + q3) / 2
                }
                var interQuantileRange = q3 - q1
                var min = q1 - 1.5 * interQuantileRange
                var max = q1 + 1.5 * interQuantileRange

                // ***********不能超过最大最小范围*****************
                if (min < _this.min_max_list[key[t]][0]) { //最小值不会为负
                    min = _this.min_max_list[key[t]][0]
                }
                if (max > _this.min_max_list[key[t]][1]) {
                    max = _this.min_max_list[key[t]][1]
                }
                // *********************************************

                var center = y1 + height / 2//中心线应该画在哪里

                var xscale_temp = d3.scaleLinear()
                    .range([xscale(t) + 6, xscale(t) + xwidth - 6])
                    .domain([_this.min_max_list[key[t]][0], _this.min_max_list[key[t]][1]])

                // 如果这个值是有意义的，即q1, median, q3, max != -1，则画盒图

                //出现max, min同一个值，为了看得更清楚，让其距离为2
                var x1_line = xscale_temp(min)
                var x2_line = xscale_temp(max)
                if (max - min < _this.min_max_list[key[t]][1] * 0.1) {
                    if (min == _this.min_max_list[key[t]][0]) {
                        x2_line = xscale_temp(max) + 2
                    } else {
                        x1_line = xscale_temp(min) - 2
                    }
                }

                var g_boxplot_control = svg.append('g')
                    .attr("width", 100)
                    .attr("height", 200)
                    .attr("class", "distribution boxplot " + flag)
                    .attr("visibility", "hidden")

                var g_boxplot = svg.append('g')
                    .attr("width", 100)
                    .attr("height", 200)
                    .attr("class", "distribution content " + flag)

                if (max != -1) {
                    // show median horizontal lines
                    g_boxplot.selectAll("toto")
                        .data([xscale_temp(median)])
                        .enter()
                        .append("line")
                        .attr("x1", function (d) { return d })
                        .attr("x2", function (d) { return d })
                        .attr("y1", y1)
                        .attr("y2", y1 + height)
                        .attr("stroke", _this.median_color)
                        .attr("stroke-width", 3)
                        .attr("opacity", 0.5)
                    //先画中心的线
                    g_boxplot_control.append("line")
                        .attr("x1", x1_line)
                        .attr("x2", x2_line)
                        .attr("y1", center)
                        .attr("y2", center)
                        .attr("stroke", _this.boundingbox_color)

                    // Show the box
                    g_boxplot_control.append("rect")
                        .attr("x", xscale_temp(q1))
                        .attr("y", y1 + height / 3)
                        .attr("height", height / 3)
                        .attr("width", function () {
                            if (xscale_temp(q3) - xscale_temp(q1) == 0) {
                                return 2
                            } else {
                                return xscale_temp(q3) - xscale_temp(q1)
                            }
                        })
                        .attr("stroke", _this.boundingbox_color)
                        .style("fill", _this.box_color)

                    // show min and max horizontal lines
                    g_boxplot_control.selectAll("toto")
                        .data([x1_line, x2_line])
                        .enter()
                        .append("line")
                        .attr("x1", function (d) { return d })
                        .attr("x2", function (d) { return d })
                        .attr("y1", y1 + height / 3)
                        .attr("y2", y1 + height / 3 * 2)
                        .attr("stroke", _this.boundingbox_color)
                } else {
                    g_boxplot.append("line")
                        .attr("x1", xscale(t) + 6)
                        .attr("x2", xscale(t) + xwidth - 6)
                        .attr("y1", center)
                        .attr("y2", center)
                        .attr("stroke", _this.boundingbox_color)
                        .attr("stroke-dasharray", "3, 5")
                }

                // 画框
                svg.append("rect")
                    .attr("x", xscale(t))
                    .attr("y", y1)
                    .attr("width", xwidth - 2)
                    .attr("height", height)
                    .attr("opacity", 0.2)
                    .style("stroke", _this.normal_color)
                    .style("fill", "none")
                    .attr("class", "distribution boundingbox " + flag)
            }
        },
        drawEachDistribution(flag, data, svg, y_start, y1, yheight, xscale, xwidth) {
            const _this = this
            // 数据格式为第n个类别，横坐标分布从x_start到x_end，然后画出里面每个attribute的分布
            let key = Object.keys(data[0])
            //console.log(key)
            for (let t = 0; t < key.length; t++) {
                //写每一个attribute的名字
                if (flag == 0) {
                    svg.append("text")
                        .attr("x", xscale(t) + (10 - key[t].length) / 0.5 + 8)
                        .attr("y", y_start - 20)
                        .attr("font-size", 7)
                        .text(key[t])
                } else {
                    svg.append("text")
                        .attr("x", xscale(t) + (10 - key[t].length) / 0.5 + 15)
                        .attr("y", y_start - 20)
                        .attr("font-size", 7)
                        .text(key[t])
                }

                let height = yheight - 5
                let data_temp = data.map(obj => { return obj[key[t]] })
                //console.log(key[t], _this.getMinOfArray(data_temp), _this.getMaxOfArray(data_temp))
                var x = d3.scaleLinear().domain([_this.min_max_list[key[t]][0], _this.min_max_list[key[t]][1]]).range([xscale(t) + 5, xscale(t) + xwidth - 5])
                var bins = d3.histogram().domain(x.domain()).thresholds(x.ticks(30))(data_temp)
                var max = d3.max(bins, function (d) { return d.y })
                var y = d3.scaleLinear().domain([0, .1]).range([y1, y1 + 30])
                var yForHistogram = d3.scaleLinear()
                    .domain([0, d3.max(bins, function (d) {
                        return d.length
                    })])
                    .range([height, 0])

                // 在每个attribute下画坐标轴
                var axis = d3.axisTop(x).ticks(3).tickSizeOuter(3).tickSizeInner(1)
                svg.append("g")
                    .attr("transform", "translate(0," + (y_start - 10) + ")")
                    .call(axis)
                    .style("font-size", "5px")
                    .attr("class", "distribution axis")

                for (let p = 0; p < bins.length; p++) {
                    svg.append("rect")
                        .attr("x", x(bins[p].x0))
                        .attr("y", yForHistogram(bins[p].length) + y1)
                        .attr("fill", _this.distribution_color)
                        .attr("width", x(bins[0].x1) - x(bins[0].x0))
                        .attr("height", function (d) {
                            return height - yForHistogram(bins[p].length)
                        })
                        .attr("class", "distribution content")
                }
                svg.append("rect")
                    .attr("x", xscale(t))
                    .attr("y", y1)
                    .attr("width", xwidth - 2)
                    .attr("height", height)
                    .attr("opacity", 0.3)
                    .style("stroke", _this.normal_color)
                    .style("fill", "none")
                    .attr("class", "distribution boundingbox")
            }
        },
        drawClusterDistribution(flag, data, x_start, y_start) {
            let attribute_number = data[0][0].length
            let cluster_number = data.length
            const _this = this
            const svg_distribution = d3.select(".svg").append("g").attr("class", "clusterdistribution")

            var attributes = [];
            for (let i = 0; i < attribute_number; i++) {
                attributes.push(i);
            }

            const xscale = d3.scaleBand()
                .range([x_start - 10, x_start + 240])
                .domain(attributes)

            var clusters = [];
            for (let i = 0; i < cluster_number; i++) {
                clusters.push(i);
            }

            const yscale = d3.scaleBand()
                .range([y_start - 15, y_start + 170])
                .domain(clusters)

            var people_sum = 0
            for (let i = 0; i < cluster_number; i++) {
                people_sum = people_sum + data[i].length
            }

            // 写上总人数
            if (flag == 0) {
                svg_distribution.append("text")
                    .attr("x", x_start + 175)
                    .attr("y", 20)
                    .attr("font-size", 15)
                    .text("sum : " + people_sum)
                    .attr("class", "active cluster name")
            }

            if (flag == 0) {
                //主动
                for (let i = 0; i < cluster_number; i++) {
                    //写cluster的序号
                    //console.log(x_start, yscale[i], clusters)
                    svg_distribution.append("rect")
                        .attr("x", x_start - 29)
                        .attr("y", yscale(i) - 3)
                        .attr("height", yscale(1) - yscale(0) - 10)
                        .attr("width", 296)
                        .attr("class", "bg a" + (i + 1))
                        .attr("fill", _this.stroke_color)
                        .attr("opacity", 0.08)
                        .attr("visibility", "hidden")

                    svg_distribution.append("text")
                        .attr("x", x_start - 28)
                        .attr("y", yscale(i) + 100 / cluster_number / 2 + 5)
                        .attr("font-size", 13)
                        .text("p" + (i + 1))
                        .attr("class", "active cluster name")

                    let data_temp = []
                    for (let j = 0; j < data[i].length; j++) {
                        data_temp.push({
                            "Fre(post)": data[i][j][0],
                            "interval": data[i][j][1],
                            "sought IS": data[i][j][2],
                            "sought ES": data[i][j][3],
                            "toxicity": data[i][j][4]
                        })
                    }
                    // 把这个组的人数放在最后面
                    svg_distribution.append("text")
                        .attr("x", x_start + 248)
                        .attr("y", 280)
                        .attr("font-size", 10)
                        .text("%")
                        .attr("class", "active cluster name")

                    svg_distribution.append("rect")
                        .attr("x", x_start + 240)
                        .attr("y", yscale(i) + 100 / cluster_number / 2 - 6)
                        .attr("width", 25)
                        .attr("height", 12)
                        .attr("fill", _this.number_color)
                        .style("stroke", "none")
                        .style("opacity", 0.5)
                        .attr("class", "active cluster name")

                    svg_distribution.append("text")
                        .attr("x", x_start + 240)
                        .attr("y", yscale(i) + 100 / cluster_number / 2 + 4)
                        .attr("font-size", 10)
                        .text((data_temp.length / people_sum).toFixed(3))
                        .attr("class", "active cluster name")

                    _this.drawEachBoxplot(0, data_temp, svg_distribution, y_start, yscale(i), 130 / cluster_number, xscale, 250 / attribute_number)
                }
            } else {
                for (let i = 0; i < cluster_number; i++) {
                    //写cluster的序号
                    // console.log(x_start, yscale[i], clusters)
                    svg_distribution.append("rect")
                        .attr("x", x_start - 28)
                        .attr("y", yscale(i) - 3)
                        .attr("height", yscale(1) - yscale(0) - 10)
                        .attr("width", 300)
                        .attr("class", "bg p" + (i + 1))
                        .attr("fill", _this.stroke_color)
                        .attr("opacity", 0.08)
                        .attr("visibility", "hidden")

                    svg_distribution.append("text")
                        .attr("x", x_start - 28)
                        .attr("y", yscale(i) + 100 / cluster_number / 2 + 5)
                        .attr("font-size", 13)
                        .text("r" + (i + 1))

                    let data_temp = []
                    for (let j = 0; j < data[i].length; j++) {
                        data_temp.push({
                            "Num(response)": data[i][j][3],
                            "Time(response)": data[i][j][0],
                            "received IS": data[i][j][1],
                            "received ES": data[i][j][2],
                        })
                    }

                    //加上人数比例
                    svg_distribution.append("text")
                        .attr("x", x_start + 248)
                        .attr("y", 510)
                        .attr("font-size", 10)
                        .text("%")
                        .attr("class", "passive cluster name")

                    svg_distribution.append("rect")
                        .attr("x", x_start + 240)
                        .attr("y", yscale(i) + 100 / cluster_number / 2 - 6)
                        .attr("width", 25)
                        .attr("height", 12)
                        .attr("fill", _this.number_color)
                        .style("stroke", "none")
                        .style("opacity", 0.5)
                        .attr("class", "passive cluster name")

                    svg_distribution.append("text")
                        .attr("x", x_start + 240)
                        .attr("y", yscale(i) + 100 / cluster_number / 2 + 4)
                        .attr("font-size", 10)
                        .text((data_temp.length / people_sum).toFixed(3))
                        .attr("class", "passive cluster name")
                    _this.drawEachBoxplot(1, data_temp, svg_distribution, y_start, yscale(i), 130 / cluster_number, xscale, 250 / attribute_number)
                }
            }
        },
        drawTitle(flag, text, svg, x_start, y_start) {
            const _this = this
            //名字

            svg.append("text")
                .attr("x", function () {
                    if (flag == 0) {
                        return x_start - 13
                    } else {
                        return x_start - 15
                    }
                })
                .attr("y", y_start + 3)
                .attr("font-size", 15)
                .text(text)

            // 中间加一个冒号
            svg.append("text")
                .attr("x", function () {
                    if (flag == 0) {
                        return x_start + 46
                    } else {
                        return x_start + 42
                    }
                })
                .attr("y", y_start + 3)
                .attr("font-size", 15)
                .text(":")

            //现在选择的k值是多少

            svg.append("text")
                .attr("x", x_start + 50)
                .attr("y", y_start + 4)
                .attr("font-size", 15)
                .text(function () {
                    if (flag == 0) {
                        return _this.active_k
                    } else {
                        return _this.passive_k
                    }
                })
                .attr("class", "kvalue " + flag)

            const slider = sliderBottom()
                .ticks(0)
                .min(1).max(10)
                .step(1).width(150)
                .handle(d3.symbol().type(d3.symbolCircle).size(100)())
                .displayValue(false)
                .on('onchange', (value) => {
                    if (flag == 0) {
                        _this.active_k = value
                    } else {
                        _this.passive_k = value
                    }
                })
                .default(5)
                .fill([_this.slider_color])

            const g = svg
                .append('g')
                .attr('transform', "translate(90," + (y_start) + ")");

            g.call(slider)
        },
        drawKInput() {
            const _this = this
            const svg_select = d3.select(".behaviorviewbody")
                .append("svg")
                .attr("width", 300)
                .attr("height", 750)
                .append("g")
                .attr("class", "svg")

            // 选择主动行为的类别数目
            _this.drawTitle(0, "proactive", svg_select, 20, 250)
            // 选择被动行为的类别数目
            _this.drawTitle(1, "reactive", svg_select, 20, 480)
        }
    }

}