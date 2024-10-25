import { linkHorizontal, svg } from 'd3';
import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as d3 from 'd3'
import $ from 'jquery'

export default {
    name: 'StageView',
    components: {
    },
    props: {
    },
    computed: {
    },
    data() {
        return {
            text_color: "black",
            comparison_color: '#868B98',//比较的时候很不同的元素会被高亮出来
            circle_color: '#9a8c98', //圆圈的颜色
            line_color: '#d8dbe2',//最左边线的颜色
            stroke_color: "#CEBB7D", //条状图点击之后behavior view会相应加深，这是点击之后的颜色
            cor_temporal_color: '#CEBB7D', //展现多维度数据temporal信息的背景
            nothighlight_color: "black", //每个stage最大的外框
            highlight_color: '#CEBB7D', //pattern view点击之后点击的元素会被highlight,也就是每个stage背景色会被改变
            distribution_color: '#C9CBD1',
            normal_color: '#2f3e46',
            stage_name: '#d6ccc2',
            cor_color: '#C9CBD1',
            background_color: 'white',
            count: 0,
            //color_list: ["#B6B6C6", "#ADB9C1", "#AFB5A4", "#EFE8BD", "#e9d1b4", "#d2aaa3"],
            color_list: ["#768f89", "#adb49f", "#EFE8BD", "#e9d1b4", "#ddbcab", "#d2aaa3"],
            // color_list: ["#B5B5C5", "#E2C9B3", "#ECC0C0", "#CAD5C3", "#9CB8CD", "#E3C6A9"],
            stage_start: 0,
            stage_interval: 0,
            stage_y_start: 0,
            stage_number: 6,
            temporal: 0,
            highlight_list: [],
            active_passive: [],
            stagestatistics: {},
            highlight_class: [],
            last_highlight_class: []
        }
    },
    watch: {
        active_passive: function () {
            const _this = this
            pipeService.emitAP(_this.active_passive)
        },
        temporal: function () {
            const _this = this
            if (_this.temporal == 1) {
                $('.temporal').attr('visibility', 'visable')
                $('.non-temporal').attr('visibility', 'hidden')
                $('.temporal-click').attr('fill', _this.distribution_color)
            } else {
                $('.non-temporal').attr('visibility', 'visable')
                $('.temporal').attr('visibility', 'hidden')
                $('.temporal-click').attr('fill', _this.background_color)
            }

        },
        highlight_list: function () {
            //console.log(this.highlight_list)
            const _this = this
            for (let i = 0; i < _this.last_highlight_class.length; i++) {
                $(_this.last_highlight_class[i]).attr("fill", _this.distribution_color)
            }
            const deviation_threshold = 0.01
            _this.highlight_class = []
            let stage_highlight = new Set()
            for (let i = 0; i < _this.stage_number; i++) {
                if (_this.highlight_list.includes(i.toString())) {
                    $('.stage_background1' + i.toString()).attr("fill", _this.highlight_color).attr("opacity", 0.1).attr("stroke-width", 0)
                } else {
                    $('.stage_background1' + i.toString()).attr("fill", "white").attr("stroke-width", 1)
                }
            }
            _this.last_highlight_class = _this.highlight_class
            for (let i = 0; i < _this.highlight_list.length; i++) {
                stage_highlight.add(_this.highlight_list[i])
            }
            let types = Object.keys(_this.stagestatistics[0])
            if (stage_highlight.size >= 2) {
                for (let t of types) {
                    let types2 = Object.keys(_this.stagestatistics[0][t])
                    for (let t2 of types2) {
                        let temp_arr = []
                        for (let stage of stage_highlight) {
                            temp_arr.push(_this.stagestatistics[stage][t][t2] / _this.dictSum(_this.stagestatistics[stage][t]))
                        }
                        if (_this.calculateVariance(temp_arr) >= deviation_threshold) {
                            //超过阈值就高亮
                            let k = 'd'
                            if (t == 1) {
                                k = 'a'
                            }
                            if (t == 2) {
                                k = 'p'
                            }
                            for (let stage of stage_highlight) {
                                //console.log('.non-temporal.' + stage + '.' + k + (parseInt(t2) + 1))
                                $('.non-temporal.' + stage + '.' + k + (parseInt(t2) + 1)).attr('fill', _this.comparison_color)
                                $('.temporal.' + stage + '.' + k + '2' + (parseInt(t2) + 1)).attr('fill', _this.comparison_color)
                                _this.highlight_class.push('.non-temporal.' + stage + '.' + k  + (parseInt(t2) + 1))
                                _this.highlight_class.push('.temporal.' + stage + '.' + k + '2' + (parseInt(t2) + 1))
                            }
                        }
                    }
                }
            }
        }
    },
    mounted: function () {
        const _this = this

        const svg = d3.select(".stageviewbody")
            .append("svg")
            .attr("width", 900)
            .attr("height", 280)
            .attr("class", "progressionstage")

        _this.drawLegend(_this.stage_number) //需要传递stage number的值

        //显示一些提示
        let g_prompt = svg.append('g')
            .attr("width", 250)
            .attr("height", 80)
            .attr("class", "prompt_2")
            .attr("visibility", "hidden")
            .attr("transform", "translate(200, 40)")
        
        let rect = g_prompt.append('rect')
            .attr('width', 600)  
            .attr('height', 130)  
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
            .text('Each behavior stage captures the dynamic changes and interactions among different behavior types over time.')
            .attr('x', 10) 
            .attr('y', 20) 
        
        text.append('tspan')
            .text('We designed two glyph modes: statistical and temporal.')
            .attr('x', 10) 
            .attr('y', 45) 

        text.append('tspan')
            .text(' - In the statistical mode, the length of the bar represents the frequency of the variable occurring at this stage.')
            .attr('x', 10) 
            .attr('y', 60) 

        text.append('tspan')
            .text(' - In the temporal mode, the overall frequency will be transformed into a temporal frequency over time.')
            .attr('x', 10) 
            .attr('y', 75) 
        
        text.append('tspan')
            .text('The lines are used to display the co-occurrence frequency between corresponding behavior types.')
            .attr('x', 10) 
            .attr('y', 100) 
        
        text.append('tspan')
            .text('The thicker the line, the higher the degree of co-occurrence.')
            .attr('x', 10) 
            .attr('y', 115) 

        const drag = d3.drag()
            .on('start', function () {
                d3.select(this).raise().classed("active", true);
                d3.event.sourceEvent.stopPropagation();
                d3.event.sourceEvent.preventDefault();
                g_prompt.raise()
            })
            .on('drag', function (event, d) {
                d3.select(this)
                    .attr("transform", "translate(" + (d3.event.x) + "," + (d3.event.y) + ")");
                g_prompt.raise()
            })
            .on('end', function (event, d) {
                d3.select(this).classed("active", false);
                var allGElements = d3.selectAll(".stage_drag");
                var allGCoords = allGElements.nodes().map(function (d) {
                    return {
                        x: parseInt(d.getAttribute("transform").match(/(\d+)/g)[0]),
                        y: parseInt(d.getAttribute("transform").match(/(\d+)/g)[1])
                    };
                });

                // 将stage元素根据x坐标进行排序
                var sortedGElements = allGElements.nodes().sort(function (a, b) {
                    return parseInt(a.getAttribute("transform").match(/(\d+)/g)[0]) - parseInt(b.getAttribute("transform").match(/(\d+)/g)[0]);
                });
                // 更新每个stage元素的位置以反映其顺序
                sortedGElements.forEach(function (gElement, i) {
                    var x = i * _this.stage_interval + _this.stage_start; // 设置每个stage元素的x坐标
                    var y = _this.stage_y_start // 保留y坐标

                    d3.select(gElement).attr("transform", "translate(" + x + "," + y + ")");
                });
                g_prompt.raise()
            });

        pipeService.onStage(function (msg) {
            var data = msg[2]
            var active_k_msg = msg[0]
            var passive_k_msg = msg[1]
            data = eval("(" + data + ")")
            //console.log('******onStage******', data)
            // *****重新map*****
            const data_map = {}
            for (let i = 0; i < _this.stage_number; i++) {
                data_map[i] = data[_this.stageMap(i)]
                console.log('******onStage******', _this.stageMap(i), i, data[_this.stageMap(i)], data_map[i])
            }
            console.log('******onStage******', data, data_map)
            _this.drawStage(active_k_msg, passive_k_msg, data_map)
            d3.selectAll(".stage_drag").call(drag)
            g_prompt.raise()
        })

        pipeService.onClickPath(function (data) {
            let list_temp = []
            for (let i = 0; i < data[0].length; i++) {
                if (~list_temp.includes(data[0][i])) {
                    list_temp.push(data[0][i])
                }
            }
            _this.highlight_list = list_temp
            g_prompt.raise()
        })

    },
    methods: {
        stageMap(stage) {
            if (stage == 2) {
                return 0
            }
            if (stage == 4) {
                return 1
            }
            if (stage == 0) {
                return 2
            }
            if (stage == 1) {
                return 3
            }
            if (stage == 3) {
                return 4
            } 
            if (stage == 5) {
                return 5
            }
        },
        calculateVariance(arr) {
            const n = arr.length;
            const mean = arr.reduce((acc, curr) => acc + curr, 0) / n;
            const variance = arr.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0) / n;
            return variance;
        },
        drawLegend(stage_number) {
            const _this = this
            const svg = d3.select(".stageviewheader")
                .append("svg")
                .attr("width", 700)
                .attr("height", 20)

            const domain_x = []
            for (let i = 0; i < stage_number; i++) {
                domain_x.push(i)
            }

            const color = d3.scaleOrdinal()
                .domain(domain_x)
                .range(_this.color_list)

            let g_legend = svg.append('g')
            g_legend.append("rect")
                .attr("x", 15)
                .attr("y", 3)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", _this.background_color)
                .attr("stroke", "black")
                .on("click", function () {
                    _this.temporal = 1 - _this.temporal
                })
                .attr("class", "temporal-click")

            g_legend.append("text")
                .attr("x", 29)
                .attr("y", 12)
                .attr("font-size", 13)
                .attr("fill", _this.text_color)
                .text("temporal")
            
            //*********假的输入框**********
            g_legend.append("rect")
                .attr("x", 200)
                .attr("y", 3)
                .attr("width", 12)
                .attr("height", 13)
                .attr("fill", _this.background_color)
                .attr("stroke", "black")

            g_legend.append("text")
                .attr("x", 109)
                .attr("y", 14)
                .attr("font-size", 13)
                .attr("fill", _this.text_color)
                .text("stage number: 6")

            for (let c = 0; c < stage_number; c++) {
                svg.append("circle")
                    .attr("cx", 225 + c * 80)
                    .attr("cy", 10)
                    .attr("r", 7)
                    .attr("fill", color(c))
                    .attr("stroke", "#5b5b5b")

                svg.append("text")
                    .attr("x", 238 + c * 80)
                    .attr("y", 14)
                    .attr("font-size", 13)
                    .text("stage " + (c + 1))
            }

            g_legend.append("circle")
                .attr("cx", 693)
                .attr("cy", 7)
                .attr("r", 5)
                .attr("fill", "white")
                .attr("stroke", "red")
                .on("mouseover", function () {
                    $(".prompt_2").attr("visibility", "visible");
                })
                .on("mouseout", function () {
                    $(".prompt_2").attr("visibility", "hidden");
                });
        
            g_legend.append("text")
                .attr("x", 690)
                .attr("y", 10)
                .attr("font-size", 8)
                .text("?")
                .attr("fill", "#bc4b51")
                .on("mouseover", function () {
                    $(".prompt_2").attr("visibility", "visible");
                })
                .on("mouseout", function () {
                    $(".prompt_2").attr("visibility", "hidden");
                });
        },
        drawStage(active_k, passive_k, data) {
            const _this = this
            const width = 880
            const height = 200
            var keys = Object.keys(data)
            const domain_x = []
            for (let i = 0; i < keys.length; i++) {
                domain_x.push(i)
            }
            var xscale = d3.scaleLinear()
                .domain([0, keys.length - 1])
                .range([120, 800])

            var color = d3.scaleOrdinal()
                .domain(domain_x)
                .range(_this.color_list)

            _this.stage_interval = xscale(1) - xscale(0)

            for (let i = 0; i < keys.length; i++) {
                _this.drawEachStage(i, data[i], 3, color, xscale(i), xscale(1) - xscale(0))
            }
        },
        splitDataByThresholds(data, thresholds, gap) {
            // 初始化分割结果数组
            var results = new Array(thresholds.length + 1);
            for (let i = 0; i < results.length; i++) {
                results[i] = new Array(data.length)
                for (let p = 0; p < results[i].length; p++) {
                    results[i][p] = 0;
                }
            }
            // 对数据点逐个进行分割
            for (let i = 0; i < data.length; i++) {
                let value = data[i];
                let j = 0;
                while (j < thresholds.length && value > thresholds[j]) {
                    results[j][i] = gap;
                    j++;
                }
                results[j][i] = value - gap * j;
                for (let k = j + 1; k < results.length; k++) {
                    results[k][i] = 0;
                }
            }

            return results;
        },
        drawEachStage(stage, data, maxcor, color_scale, x_start, interval) {
            const _this = this
            const data_orig = data
            var data_summary = new Array()
            var data_summary_all = { "depression": new Array(), "active behavior": new Array(), "passive behavior": new Array() } //用来包含所有的点
            var data_statistics = new Array()
            var data_statistics_all = new Array() //用来包含所有的点
            var segment_length = data.length
            var corr_statistics = new Array()
            var data_concat = new Array()
            var corr_statistics_all = new Array()
            for (let i = 0; i < segment_length; i++) {
                data_summary[i] = { "depression": new Array(), "active behavior": new Array(), "passive behavior": new Array() } //存储每一个时间点关于三个的统计
                data_statistics[i] = new Array()
                data_concat = data_concat.concat(data[i])
                for (let j = 0; j < data[i].length; j++) {
                    data_summary[i]["depression"].push(_this.depressionThreshold(data[i][j][0]))
                    data_summary[i]["active behavior"].push(data[i][j][1])
                    data_summary[i]["passive behavior"].push(data[i][j][2])
                    data_summary_all["depression"].push(_this.depressionThreshold(data[i][j][0]))
                    data_summary_all["active behavior"].push(data[i][j][1])
                    data_summary_all["passive behavior"].push(data[i][j][2])
                }
                corr_statistics.push(_this.correlationSummarize(data[i], maxcor))
                data_statistics[i].push(
                    _this.getFrequency(data_summary[i]["depression"]),
                    _this.getFrequency(data_summary[i]["active behavior"]),
                    _this.getFrequency(data_summary[i]["passive behavior"])
                )
            }
            _this.stagestatistics[stage] = data_statistics_all
            corr_statistics_all = _this.correlationSummarize(data_concat, maxcor)
            data_statistics_all.push(
                _this.getFrequency(data_summary_all["depression"]),
                _this.getFrequency(data_summary_all["active behavior"]),
                _this.getFrequency(data_summary_all["passive behavior"])
            )
            //开始画图
            const svg = d3.select(".progressionstage")
            const svg_stage = svg.append("g")
                .attr("width", 300)
                .attr("height", 280)
                .attr("class", "stage_drag " + stage)
                .style("z-index", 2)
                .attr("transform", "translate(" + (x_start - 50) + ",0)")
            if (stage == 0) {
                _this.stage_start = x_start - 50
            }
            const svg_1 = svg_stage.append("g")
                .attr("width", 300)
                .attr("height", 280)
                .attr("class", "stage_single" + stage)
                .attr("id", "stage_single" + stage)
                .style("z-index", 2)

            const svg_3 = svg.append("g")
                .attr("width", 880)
                .attr("height", 280)
                .attr("class", "legend")
                .style("z-index", 2)
                .attr("transform", "translate(10, 0)")

            let y_start = 30
            const width_scale = interval / 2
            const height_scale = 11

            let x_start1 = 50

            // 画背景
            svg_1.append("rect")
                .attr("x", x_start1 - 35)
                .attr("y", y_start - 15)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("height", 220)
                .attr("width", 110)
                .attr("fill", "white")
                .attr("stroke", _this.nothighlight_color)
                .attr("stroke-width", 1)
                .attr("opacity", 0.1)
                .attr("class", "stage_background1" + stage)

            // 画stage标志
            svg_1.append("circle")
                .attr("cx", x_start1 - 35)
                .attr("cy", y_start - 15)
                .attr("r", 7)
                .attr("fill", color_scale(stage))
                .attr("stroke", _this.nothighlight_color)
                .attr("stroke-width", 0.2)
                .attr("class", "stage_background2" + stage)
                .on("click", function () {
                    if (_this.highlight_list.includes(stage.toString())) {
                        let temp = []
                        for (let i = 0; i < _this.highlight_list.length; i++) {
                            if (_this.highlight_list[i] != stage.toString()) {
                                temp.push(_this.highlight_list[i])
                            }
                        }
                        _this.highlight_list = temp
                        //console.log(_this.highlight_list)
                    } else {
                        _this.highlight_list.push(stage.toString())
                        //console.log(_this.highlight_list)
                    }
                })
            
            svg_1.append("text")
                .attr("x", x_start1 - 39)
                .attr("y", y_start - 10)
                .attr("font-size", 13)
                .attr("fill", 'white')
                .text(stage + 1)
                .attr("class", "stage_background2" + stage)
                .on("click", function () {
                    if (_this.highlight_list.includes(stage.toString())) {
                        let temp = []
                        for (let i = 0; i < _this.highlight_list.length; i++) {
                            if (_this.highlight_list[i] != stage.toString()) {
                                temp.push(_this.highlight_list[i])
                            }
                        }
                        _this.highlight_list = temp
                        //console.log(_this.highlight_list)
                    } else {
                        _this.highlight_list.push(stage.toString())
                        //console.log(_this.highlight_list)
                    }
                })
            //.attr("opacity", 0.5)

            // 画单个attribute
            const position = {} // 记录纵坐标位置
            for (let i = 0; i < data_statistics_all.length; i++) {
                let y_start2 = y_start
                let keys_i = Object.keys(data_statistics_all[i])
                let values_i = Object.values(data_statistics_all[i])
                svg_3.append("rect")
                    .attr("x", 10)
                    .attr("y", y_start)
                    .attr("height", height_scale * keys_i.length + 3 * (keys_i.length - 1))
                    .attr("width", 2)
                    .attr("fill", "#5b5b5b")
                    .attr("opacity", 0.2)

                svg_1.append("rect")
                    .attr("x", x_start1 - 5)
                    .attr("y", y_start)
                    .attr("height", height_scale * keys_i.length + 3 * (keys_i.length - 1))
                    .attr("width", width_scale)
                    .attr("fill", "#5b5b5b")
                    .attr("opacity", 0.05)
                    .attr("rx", 3)
                    .attr("ry", 3)

                svg_1.append("rect")
                    .attr("x", x_start1 - 3)
                    .attr("y", y_start)
                    .attr("height", height_scale * keys_i.length + 3 * (keys_i.length - 1))
                    .attr("width", 3)
                    .attr("fill", "#cbcbcb")
                    // .attr("opacity", 0.3)
                for (let j = 0; j < keys_i.length; j++) {
                    // 画legend
                    if (i == 0) {
                        svg_3.append("text")
                            .attr("x", 15)
                            .attr("y", y_start + height_scale - 2)
                            .attr("font-size", 13)
                            .text(function () {
                                if (j == 0) {
                                    return 'low'
                                } else if (j == 1) {
                                    return 'medium'
                                } else {
                                    return 'high'
                                }
                            })
                            .attr("opacity", 0.2)
                    } else if (i == 1) {
                        svg_3.append("text")
                            .attr("x", 15)
                            .attr("y", y_start + height_scale - 2)
                            .attr("font-size", 13)
                            .text("p" + (j + 1))
                            .attr("opacity", 0.2)
                    } else {
                        svg_3.append("text")
                            .attr("x", 15)
                            .attr("y", y_start + height_scale - 2)
                            .attr("font-size", 13)
                            .text("r" + (j + 1))
                            .attr("opacity", 0.2)
                    }
                    position[i.toString() + j.toString()] = y_start + height_scale / 2
                    // 这里是画中间的小方块，注意是non-temporal信息
                    svg_1.append("rect")
                        .attr("x", x_start1)
                        .attr("y", y_start)
                        .attr("height", height_scale)
                        .attr("width", data_statistics_all[i][j] / _this.sum(values_i) * width_scale)
                        .attr("fill", _this.distribution_color)
                        .attr("class", function () {
                            if (i == 1) {
                                return "non-temporal " + stage + ' a' + (j + 1)
                            } else if (i == 2) {
                                return "non-temporal " + stage + ' p' + (j + 1)
                            } else {
                                return "non-temporal " + stage + ' d' + (j + 1)
                            }
                        })
                        .attr("stroke", _this.stroke_color)
                        .attr("stroke-width", 0.05)
                        //hover在bar上
                        .on('mouseenter', function () {
                            $(this).attr("fill", _this.stroke_color)
                            let type = $(this).attr('class').split(' ')[2][0] //d a p
                            let order = parseInt($(this).attr('class').split(' ')[2][1]) - 1 // 1 2 3 4...
                            //需要提取出所有相连的线以及bar
                            let keys_temp = ['de_ac', 'ac_pa', 'de_pa', 'de_ac_pa']
                            for (let i = 0; i < keys_temp.length; i++) {
                                for (let j = 0; j < corr_statistics_all[keys_temp[i]].length; j++) {
                                    let name_temp = keys_temp[i]
                                    let value_temp = parseInt(corr_statistics_all[keys_temp[i]][j][0])
                                    // 首先画bar
                                    if (i == 3) {
                                        let temp0 = parseInt(value_temp / 100)
                                        let temp2 = value_temp % 10
                                        let temp1 = parseInt((value_temp - temp0 * 100) / 10)
                                        if (type == 'd') {
                                            if (order != temp0) {
                                                continue
                                            }
                                        }
                                        if (type == 'a') {
                                            if (order != temp1) {
                                                continue
                                            }
                                        }
                                        if (type == 'p') {
                                            if (order != temp2) {
                                                continue
                                            }
                                        }
                                        _this.active_passive.push('a' + (temp1 + 1))
                                        _this.active_passive.push('p' + (temp2 + 1))
                                        $('.stage' + stage + '.de_ac_pa.' + value_temp).attr("stroke", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.d' + (temp0 + 1)).attr("fill", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.a' + (temp1 + 1)).attr("fill", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.p' + (temp2 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.d2' + (temp0 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.a2' + (temp1 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.p2' + (temp2 + 1)).attr("fill", _this.stroke_color)
                                    } else {
                                        let temp0 = parseInt(value_temp / 10)
                                        let temp1 = value_temp % 10
                                        let k0 = 'd'
                                        let k1 = 'a'
                                        let kk = 'de_ac'
                                        if (i == 0) {
                                            if (type == 'd') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'a') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                continue
                                            }
                                        }
                                        if (i == 1) {
                                            if (type == 'a') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'd') {
                                                continue
                                            }
                                            k0 = 'a'
                                            k1 = 'p'
                                            kk = 'ac_pa'
                                        }
                                        if (i == 2) {
                                            if (type == 'd') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'a') {
                                                continue
                                            }
                                            k1 = 'p'
                                            kk = 'de_pa'
                                        }
                                        _this.active_passive.push(k0 + (temp0 + 1))
                                        _this.active_passive.push(k1 + (temp1 + 1))
                                        $('.stage' + stage + '.' + kk + "." + value_temp).attr("stroke", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.' + k0 + (temp0 + 1)).attr("fill", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.' + k1 + (temp1 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.' + k0 + '2' + (temp0 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.' + k1 + '2' + (temp1 + 1)).attr("fill", _this.stroke_color)
                                    }
                                }
                            }
                        })
                        .on('mouseleave', function () {
                            let class_name_split = type = $(this).attr('class').split(' ')
                            let class_name = '.'
                            for (let c = 0; c < class_name_split.length; c++) {
                                class_name += class_name_split[c]
                                if (c < class_name_split.length - 1) {
                                    class_name += '.'
                                }
                            }
                            if (_this.highlight_class.includes(class_name)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                            let type = $(this).attr('class').split(' ')[2][0] //d a p
                            let order = parseInt($(this).attr('class').split(' ')[2][1]) - 1 // 1 2 3 4...
                            //console.log(type, order)
                            //需要提取出所有相连的线以及bar
                            let keys_temp = ['de_ac', 'ac_pa', 'de_pa', 'de_ac_pa']
                            for (let i = 0; i < keys_temp.length; i++) {
                                for (let j = 0; j < corr_statistics_all[keys_temp[i]].length; j++) {
                                    let name_temp = keys_temp[i]
                                    let value_temp = parseInt(corr_statistics_all[keys_temp[i]][j][0])
                                    // 首先画bar
                                    if (i == 3) {
                                        let temp0 = parseInt(value_temp / 100)
                                        let temp2 = value_temp % 10
                                        let temp1 = parseInt((value_temp - temp0 * 100) / 10)
                                        if (type == 'd') {
                                            if (order != temp0) {
                                                continue
                                            }
                                        }
                                        if (type == 'a') {
                                            if (order != temp1) {
                                                continue
                                            }
                                        }
                                        if (type == 'p') {
                                            if (order != temp2) {
                                                continue
                                            }
                                        }
                                        _this.active_passive = _this.removeElement(_this.active_passive, ['d' + (temp0 + 1), 'a' + (temp1 + 1), 'p' + (temp2 + 1)])
                                        $('.stage' + stage + '.de_ac_pa.' + value_temp).attr("stroke", _this.line_color)
                                        $('.non-temporal.' + stage + '.d' + (temp0 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.d' + (temp0 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.non-temporal.' + stage + '.a' + (temp1 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.a' + (temp1 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.non-temporal.' + stage + '.p' + (temp2 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.p' + (temp2 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.temporal.' + stage + '.d2' + (temp0 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.d2' + (temp0 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.temporal.' + stage + '.a2' + (temp1 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.a2' + (temp1 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.temporal.' + stage + '.p2' + (temp2 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.p2' + (temp2 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                    } else {
                                        let temp0 = parseInt(value_temp / 10)
                                        let temp1 = value_temp % 10
                                        let k0 = 'd'
                                        let k1 = 'a'
                                        let kk = 'de_ac'
                                        if (i == 0) {
                                            if (type == 'd') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'a') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                continue
                                            }
                                        }
                                        if (i == 1) {
                                            if (type == 'a') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'd') {
                                                continue
                                            }
                                            k0 = 'a'
                                            k1 = 'p'
                                            kk = 'ac_pa'
                                        }
                                        if (i == 2) {
                                            if (type == 'd') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'a') {
                                                continue
                                            }
                                            k1 = 'p'
                                            kk = 'de_pa'
                                        }
                                        _this.active_passive = _this.removeElement(_this.active_passive, [k0 + (temp0 + 1), k1 + (temp1 + 1)])
                                        $('.stage' + stage + '.' + kk + "." + value_temp).attr("stroke", _this.distribution_color)
                                        $('.non-temporal.' + stage + '.' + k0 + (temp0 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.' + k0 + (temp0 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.non-temporal.' + stage + '.' + k1 + (temp1 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.' + k1 + (temp1 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.temporal.' + stage + '.' + k0 + '2' + (temp0 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.' + k0 + '2' + (temp0 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.temporal.' + stage + '.' + k1 + '2' + (temp1 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.' + k1 + '2' + (temp1 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                    }
                                }
                            }
                        })
                        .on("click", function () {
                            if (i != 0) {
                                if ($(this).attr('stroke-width') == 0.05) {
                                    //表示高亮
                                    $(this).attr('stroke-width', 1)
                                    if (i == 1) {
                                        //代表点击的active
                                        $(".temporal." + stage + '.a' + (j + 1)).attr('stroke', _this.stroke_color)
                                        _this.active_passive.push('a' + (j + 1))
                                    }
                                    if (i == 2) {
                                        //代表点击的passive
                                        $(".temporal." + stage + '.p' + (j + 1)).attr('stroke', _this.stroke_color)
                                        _this.active_passive.push('p' + (j + 1))
                                    }
                                } else {
                                    //表示取消点击
                                    $(this).attr('stroke-width', 0.05)
                                    if (i == 1) {
                                        //代表点击的active
                                        $(".temporal." + stage + '.a' + (j + 1)).attr('stroke', '#e5e5e5')
                                        let temp_list = []
                                        let flag = 1
                                        for (let p = 0; p < _this.active_passive.length; p++) {
                                            if (flag == 1 && _this.active_passive[p] == 'a' + (j + 1)) {
                                                flag = 0
                                                continue
                                            }
                                            temp_list.push(_this.active_passive[p])
                                        }
                                        _this.active_passive = temp_list
                                    }
                                    if (i == 2) {
                                        //代表点击的passive
                                        $(".temporal." + stage + '.p' + (j + 1)).attr('stroke', '#e5e5e5')
                                        let temp_list = []
                                        let flag = 1
                                        for (let p = 0; p < _this.active_passive.length; p++) {
                                            if (flag == 1 && _this.active_passive[p] == 'p' + (j + 1)) {
                                                flag = 0
                                                continue
                                            }
                                            temp_list.push(_this.active_passive[p])
                                        }
                                        _this.active_passive = temp_list
                                    }
                                }
                            }
                        })
                    // 这个地方需要加上每一个atribute的temporal信息
                    let yScale = d3.scaleLinear()
                        .domain([0, 1])
                        .range([height_scale, 0]);
                    let yScale2 = d3.scaleLinear()
                        .domain([0, 0.2])
                        .range([height_scale, 0]);
                    let area = d3.area()
                        .x(function (d) { return d.x })
                        .y0(height_scale)
                        .y1(function (d) { return yScale(d.y) })
                    let temporal_temp = []
                    let temporal_horizon = []
                    for (let p = 0; p < data_statistics.length; p++) {
                        if (typeof data_statistics[p][i][j] != 'number') {
                            data_statistics[p][i][j] = 0
                        }
                        temporal_temp.push(
                            { x: x_start1 + p * width_scale / data_statistics.length, y: data_statistics[p][i][j] / data[j].length }
                        )
                        temporal_horizon.push(data_statistics[p][i][j] / data[j].length)
                    }

                    //这里是加那些小方块，但是注意要是temporal信息
                    svg_1.append("rect")
                        .attr("x", x_start1)
                        .attr("y", y_start)
                        .attr("height", height_scale)
                        .attr("width", width_scale - 5)
                        .attr("fill", 'white')
                        .attr("stroke", "#e5e5e5")
                        .attr("stroke-width", 1)
                        .attr("opacity", 0.2)
                        .attr("visibility", "hidden")
                        .on("click", function () {
                            if (i != 0) {
                                if ($(this).attr('stroke') == "#e5e5e5") {
                                    //表示高亮了
                                    $(this).attr('stroke', _this.stroke_color)
                                    if (i == 1) {
                                        //代表点击的active
                                        $(".non-temporal." + stage + '.a' + (j + 1)).attr('stroke-width', 1)
                                        _this.active_passive.push('a' + (j + 1))
                                    }
                                    if (i == 2) {
                                        //代表点击的passive
                                        $(".non-temporal." + stage + '.p' + (j + 1)).attr('stroke-width', 1)
                                        _this.active_passive.push('p' + (j + 1))
                                    }
                                } else {
                                    //表示取消点击
                                    $(this).attr('stroke', "#e5e5e5")
                                    if (i == 1) {
                                        //代表点击的active
                                        $(".non-temporal." + stage + '.a' + (j + 1)).attr('stroke-width', 0.05)
                                        let temp_list = []
                                        let flag = 1
                                        for (let p = 0; p < _this.active_passive.length; p++) {
                                            if (flag == 1 && _this.active_passive[p] == 'a' + (j + 1)) {
                                                flag = 0
                                                continue
                                            }
                                            temp_list.push(_this.active_passive[p])
                                        }
                                        _this.active_passive = temp_list
                                    }
                                    if (i == 2) {
                                        //代表点击的passive
                                        $(".non-temporal." + stage + '.p' + (j + 1)).attr('stroke-width', 0.05)
                                        let temp_list = []
                                        let flag = 1
                                        for (let p = 0; p < _this.active_passive.length; p++) {
                                            if (flag == 1 && _this.active_passive[p] == 'p' + (j + 1)) {
                                                flag = 0
                                                continue
                                            }
                                            temp_list.push(_this.active_passive[p])
                                        }
                                        _this.active_passive = temp_list
                                    }
                                }
                            }
                        })
                    const thresholds = [0.2, 0.4, 0.6, 0.8]

                    let areaGenerator = d3.area()
                        .x(function (d, i) { return x_start1 + i * (width_scale + 10) / data_statistics.length; })
                        .y0(height_scale)
                        .y1(function (d) { return yScale2(d); })
                        .curve(d3.curveBasis);

                    let layers = _this.splitDataByThresholds(temporal_horizon, thresholds, 0.2)
                    let svg_1_1 = svg_1.append('g')
                        .attr("transform", "translate(0," + y_start + ")")

                    svg_1_1.selectAll(".layer")
                        .data(layers)
                        .enter().append("path")
                        .attr("class", "layer")
                        .attr("d", areaGenerator)
                        .attr("opacity", function (d, i) { return (i + 1) * 0.3 })
                        .attr("fill", _this.distribution_color)
                        .attr("class", function () {
                            if (i == 1) {
                                return "temporal " + stage + ' a2' + (j + 1)
                            } else if (i == 2) {
                                return "temporal " + stage + ' p2' + (j + 1)
                            } else {
                                return "temporal " + stage + ' d2' + (j + 1)
                            }
                        })
                        .on('mouseenter', function () {
                            $(this).attr("fill", _this.stroke_color)
                            let type = $(this).attr('class').split(' ')[2][0] //d a p
                            let order = parseInt($(this).attr('class').split(' ')[2][2]) - 1 // 1 2 3 4...
                            //需要提取出所有相连的线以及bar
                            let keys_temp = ['de_ac', 'ac_pa', 'de_pa', 'de_ac_pa']
                            for (let i = 0; i < keys_temp.length; i++) {
                                for (let j = 0; j < corr_statistics_all[keys_temp[i]].length; j++) {
                                    let name_temp = keys_temp[i]
                                    let value_temp = parseInt(corr_statistics_all[keys_temp[i]][j][0])
                                    // 首先画bar
                                    if (i == 3) {
                                        let temp0 = parseInt(value_temp / 100)
                                        let temp2 = value_temp % 10
                                        let temp1 = parseInt((value_temp - temp0 * 100) / 10)
                                        if (type == 'd') {
                                            if (order != temp0) {
                                                continue
                                            }
                                        }
                                        if (type == 'a') {
                                            if (order != temp1) {
                                                continue
                                            }
                                        }
                                        if (type == 'p') {
                                            if (order != temp2) {
                                                continue
                                            }
                                        }
                                        _this.active_passive.push('a' + (temp1 + 1))
                                        _this.active_passive.push('p' + (temp2 + 1))
                                        $('.stage' + stage + '.de_ac_pa.' + value_temp).attr("stroke", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.d' + (temp0 + 1)).attr("fill", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.a' + (temp1 + 1)).attr("fill", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.p' + (temp2 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.d2' + (temp0 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.a2' + (temp1 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.p2' + (temp2 + 1)).attr("fill", _this.stroke_color)
                                    } else {
                                        let temp0 = parseInt(value_temp / 10)
                                        let temp1 = value_temp % 10
                                        let k0 = 'd'
                                        let k1 = 'a'
                                        let kk = 'de_ac'
                                        if (i == 0) {
                                            if (type == 'd') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'a') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                continue
                                            }
                                        }
                                        if (i == 1) {
                                            if (type == 'a') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'd') {
                                                continue
                                            }
                                            k0 = 'a'
                                            k1 = 'p'
                                            kk = 'ac_pa'
                                        }
                                        if (i == 2) {
                                            if (type == 'd') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'a') {
                                                continue
                                            }
                                            k1 = 'p'
                                            kk = 'de_pa'
                                        }
                                        _this.active_passive.push(k0 + (temp0 + 1))
                                        _this.active_passive.push(k1 + (temp1 + 1))
                                        $('.stage' + stage + '.' + kk + "." + value_temp).attr("stroke", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.' + k0 + (temp0 + 1)).attr("fill", _this.stroke_color)
                                        $('.non-temporal.' + stage + '.' + k1 + (temp1 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.' + k0 + '2' + (temp0 + 1)).attr("fill", _this.stroke_color)
                                        $('.temporal.' + stage + '.' + k1 + '2' + (temp1 + 1)).attr("fill", _this.stroke_color)
                                    }
                                }
                            }
                        })
                        .on('mouseleave', function () {
                            let class_name_split = type = $(this).attr('class').split(' ')
                            let class_name = '.'
                            for (let c = 0; c < class_name_split.length; c++) {
                                class_name += class_name_split[c]
                                if (c < class_name_split.length - 1) {
                                    class_name += '.'
                                }
                            }
                            //console.log(class_name, _this.highlight_class)
                            if (_this.highlight_class.includes(class_name)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                            let type = $(this).attr('class').split(' ')[2][0] //d a p
                            let order = parseInt($(this).attr('class').split(' ')[2][2]) - 1 // 1 2 3 4...
                            //console.log(type, order)
                            //需要提取出所有相连的线以及bar
                            let keys_temp = ['de_ac', 'ac_pa', 'de_pa', 'de_ac_pa']
                            for (let i = 0; i < keys_temp.length; i++) {
                                for (let j = 0; j < corr_statistics_all[keys_temp[i]].length; j++) {
                                    let name_temp = keys_temp[i]
                                    let value_temp = parseInt(corr_statistics_all[keys_temp[i]][j][0])
                                    // 首先画bar
                                    if (i == 3) {
                                        let temp0 = parseInt(value_temp / 100)
                                        let temp2 = value_temp % 10
                                        let temp1 = parseInt((value_temp - temp0 * 100) / 10)
                                        if (type == 'd') {
                                            if (order != temp0) {
                                                continue
                                            }
                                        }
                                        if (type == 'a') {
                                            if (order != temp1) {
                                                continue
                                            }
                                        }
                                        if (type == 'p') {
                                            if (order != temp2) {
                                                continue
                                            }
                                        }
                                        _this.active_passive = _this.removeElement(_this.active_passive, ['a' + (temp1 + 1), 'p' + (temp2 + 1)])
                                        $('.stage' + stage + '.de_ac_pa.' + value_temp).attr("stroke", _this.line_color)
                                        $('.non-temporal.' + stage + '.d' + (temp0 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.d' + (temp0 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.non-temporal.' + stage + '.a' + (temp1 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.a' + (temp1 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.non-temporal.' + stage + '.p' + (temp2 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.p' + (temp2 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.temporal.' + stage + '.d2' + (temp0 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.d2' + (temp0 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.temporal.' + stage + '.a2' + (temp1 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.a2' + (temp1 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                        $('.temporal.' + stage + '.p2' + (temp2 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.p2' + (temp2 + 1))) {
                                                return _this.comparison_color
                                            } else {
                                                return _this.distribution_color
                                            }
                                        })
                                    } else {
                                        let temp0 = parseInt(value_temp / 10)
                                        let temp1 = value_temp % 10
                                        let k0 = 'd'
                                        let k1 = 'a'
                                        let kk = 'de_ac'
                                        if (i == 0) {
                                            if (type == 'd') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'a') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                continue
                                            }
                                        }
                                        if (i == 1) {
                                            if (type == 'a') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'd') {
                                                continue
                                            }
                                            k0 = 'a'
                                            k1 = 'p'
                                            kk = 'ac_pa'
                                        }
                                        if (i == 2) {
                                            if (type == 'd') {
                                                if (order != temp0) {
                                                    continue
                                                }
                                            }
                                            if (type == 'p') {
                                                if (order != temp1) {
                                                    continue
                                                }
                                            }
                                            if (type == 'a') {
                                                continue
                                            }
                                            k1 = 'p'
                                            kk = 'de_pa'
                                        }
                                        _this.active_passive = _this.removeElement(_this.active_passive, [k0 + (temp0 + 1), k1 + (temp1 + 1)])
                                        $('.stage' + stage + '.' + kk + "." + value_temp).attr("stroke", _this.distribution_color)
                                        $('.non-temporal.' + stage + '.' + k0 + (temp0 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.' + k0 + (temp0 + 1))) {
                                                $(this).attr("fill", _this.comparison_color)
                                            } else {
                                                $(this).attr("fill", _this.distribution_color)
                                            }
                                        })
                                        $('.non-temporal.' + stage + '.' + k1 + (temp1 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.non-temporal.' + stage + '.' + k1 + (temp1 + 1))) {
                                                $(this).attr("fill", _this.comparison_color)
                                            } else {
                                                $(this).attr("fill", _this.distribution_color)
                                            }
                                        })
                                        $('.temporal.' + stage + '.' + k0 + '2' + (temp0 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.' + k0 + '2' + (temp0 + 1))) {
                                                $(this).attr("fill", _this.comparison_color)
                                            } else {
                                                $(this).attr("fill", _this.distribution_color)
                                            }
                                        })
                                        $('.temporal.' + stage + '.' + k1 + '2' + (temp1 + 1)).attr("fill", function () {
                                            if (_this.highlight_class.includes('.temporal.' + stage + '.' + k1 + '2' + (temp1 + 1))) {
                                                $(this).attr("fill", _this.comparison_color)
                                            } else {
                                                $(this).attr("fill", _this.distribution_color)
                                            }
                                        })
                                    }
                                }
                            }
                        })
                        .attr("visibility", "hidden")

                    y_start += height_scale + 3
                }
                svg_3.append("text")
                    .attr("x", 0)
                    .attr("y", (y_start + y_start2) / 2)
                    .attr("font-size", 14)
                    .text(function () {
                        if (i == 0) {
                            return 'd'
                        } else if (i == 1) {
                            return 'p'
                        } else {
                            return 'r'
                        }
                    })
                    .attr("opacity", 0.2)
                y_start += 10
            }

            // 画变量之间的interaction
            const svg2 = svg_stage.append("g")
                .attr("width", 300)
                .attr("height", 280)
                .attr("class", "stage_interaction" + stage)
                .attr("id", "stage_single" + stage)
                .style("z-index", 1)
                
            // 先画两个两个一起出现的，并且标注出最大的那一个，其他的opacity调整很低
            let keys_c = ['de_ac', 'ac_pa', 'de_pa']
            let cor_temp_keys = Object.keys(corr_statistics_all['de_ac_pa'])
            //console.log(corr_statistics_all['de_ac_pa'])
            const lineGenerator = d3.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .curve(d3.curveLinear)
            const height_curve_scale1 = d3.scaleLinear()
                .domain([60, 150])
                .range([10, 20])

            var x_left_list = []
            for (let i = 0; i < keys_c.length; i++) {
                let cor_temp = corr_statistics_all[keys_c[i]]
                for (let j = 0; j < cor_temp.length; j++) {
                    let temp = parseInt(cor_temp[j][0])
                    let temp0 = parseInt(temp / 10).toString()
                    let temp1 = (temp % 10).toString()
                    let key_1 = ''
                    let key_2 = ''
                    if (i == 0) {
                        key_1 = '0' + temp0
                        key_2 = '1' + temp1
                        let flag = 0
                        for (let t = 0; t < cor_temp_keys.length; t++) {
                            //console.log("***", (parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0]) - parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0])%10)/10)
                            if (parseInt(cor_temp[j]) == (parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0]) - parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0]) % 10) / 10) {
                                flag = 1
                                break;
                            }
                        }
                        if (flag == 1) {
                            continue
                        }
                    } else if (i == 1) {
                        key_1 = '1' + temp0
                        key_2 = '2' + temp1
                        let flag = 0
                        for (let t = 0; t < cor_temp_keys.length; t++) {
                            //console.log("***", parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0]) - parseInt(parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0])/100) * 100)
                            if (parseInt(cor_temp[j]) == parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0]) - parseInt(parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0]) / 100) * 100) {
                                flag = 1
                                break;
                            }
                        }
                        if (flag == 1) {
                            continue
                        }
                    } else {
                        key_1 = '0' + temp0
                        key_2 = '2' + temp1
                        let flag = 0
                        for (let t = 0; t < cor_temp_keys.length; t++) {
                            //console.log("***", parseInt(parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0])/100) * 10)
                            if (parseInt(cor_temp[j]) == parseInt([corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0]][0]) % 10 + parseInt(parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[t]][0]) / 100) * 10) {
                                flag = 1
                                break;
                            }
                        }
                        if (flag == 1) {
                            continue
                        }
                    }
                    let y1 = position[key_1]
                    let y2 = position[key_2]
                    let x_left = x_start1 - height_curve_scale1(y2 - y1)
                    let flag_xl = 0
                    for (let xl = 0; xl < x_left_list.length; xl++) {
                        if (Math.abs(x_left_list[xl] - x_left) < 3) {
                            x_left -= 3
                            x_left_list.push(x_left)
                            flag_xl = 1
                            break
                        }
                    }
                    if (flag_xl == 0) {
                        x_left_list.push(x_left)
                    }
                    let x_right = x_start1 - 5
                    let data1 = [
                        { x: x_right, y: y1 },
                        { x: x_left, y: y1 },
                        { x: x_left, y: y2 },
                        { x: x_right, y: y2 }
                    ]
                    //开始计算co-occurence出现的情况
                    let corr_temporal = []
                    for (let p = 0; p < corr_statistics.length; p++) {
                        let flag_temp = 0
                        for (let q = 0; q < corr_statistics[p][keys_c[i]].length; q++) {
                            if (corr_statistics[p][keys_c[i]][q][0] == cor_temp[j][0]) {
                                flag_temp = 1
                                corr_temporal.push(corr_statistics[p][keys_c[i]][q][1])
                                break
                            }
                        }
                        if (flag_temp == 0) {
                            corr_temporal.push(0)
                        }
                    }

                    let yScale = d3.scaleLinear()
                        .domain([0, 0.5])
                        .range([height_scale, 0])

                    let area = d3.area()
                        .x(function (d) { return d.x })
                        .y0(height_scale)
                        .y1(function (d) { return yScale(d.y) })

                    let temporal_temp = []
                    let temporal_horizon = []

                    for (let p = 0; p < corr_temporal.length; p++) {
                        temporal_temp.push(
                            { x: x_left + 5 + p * width_scale / data_statistics.length, y: corr_temporal[p] }
                        )
                        temporal_horizon.push(corr_temporal[p])
                    }

                    //开始画co-temporal
                    let svg_t = svg2.append('g').attr("class", "co_tem" + stage + i + cor_temp[j][0])
                        .attr("transform", "translate(5, 0)")
                        .attr("visibility", "hidden")
                        
                    svg_t.append("rect")
                        .attr("x", x_left + 2)
                        .attr("y", (y1 + y2) / 2 + 5)
                        .attr("height", height_scale)
                        .attr("width", width_scale - 5)
                        .attr("fill", 'white')
                        .attr("class", "temporal")
                        .attr("stroke", "#5b5b5b")

                    svg_t.append("rect")
                        .attr("x", x_left + 2)
                        .attr("y", (y1 + y2) / 2 + 5)
                        .attr("height", height_scale)
                        .attr("width", width_scale - 5)
                        .attr("fill", '#5b5b5b')
                        .attr("class", "temporal")
                        .attr("stroke", "black")
                        .attr("opacity", 0.05)

                    let thresholds = [0.1, 0.2, 0.3, 0.4, 0.5]

                    let yScale2 = d3.scaleLinear()
                        .domain([0, 0.1])
                        .range([height_scale, 0]);

                    let areaGenerator = d3.area()
                        .x(function (d, i) { return x_start1 + i * (width_scale + 10) / data_statistics.length; })
                        .y0(height_scale)
                        .y1(function (d) { return yScale2(d); })
                        .curve(d3.curveBasis);

                    let layers = _this.splitDataByThresholds(temporal_horizon, thresholds, 0.1)
                    let svg_t_1 = svg_t.append('g')
                        .attr("transform", "translate(" + (x_left - 48) + "," + ((y1 + y2) / 2 + 5) + ")")

                    svg_t_1.selectAll(".layer_co")
                        .data(layers)
                        .enter().append("path")
                        .attr("class", "layer")
                        .attr("d", areaGenerator)
                        .attr("opacity", function (d, i) { return (i + 1) * 0.3 })
                        .attr("fill", _this.cor_temporal_color)
                        .attr("class", "temporal")
                    //.attr("visibility", "hidden")

                    svg2.append("circle")
                        .attr("cx", x_left)
                        .attr("cy", (y1 + y2) / 2)
                        .attr("r", 2)
                        .attr("fill", _this.circle_color)
                        .attr("opacity", 0.4)
                        .attr("class", "temporal " + "stage" + stage + " " + keys_c[i] + " " + cor_temp[j][0])
                        .attr("visibility", "hidden")
                        .on('mouseenter', function () {
                            $('.co_tem' + stage + i + cor_temp[j][0]).attr("visibility", "visable")
                            $(this).attr('stroke', _this.stroke_color)
                            let class_name = $(this).attr('class').split(' ')
                            let class_name1 = class_name[2]
                            let class_name2 = parseInt(class_name[3])
                            let first_type = (parseInt(class_name2 / 10) + 1).toString()
                            let second_type = ((class_name2 % 10) + 1).toString()
                            _this.active_passive.push(class_name1[0] + first_type)
                            _this.active_passive.push(class_name1[3] + second_type)
                            $(".temporal." + stage + "." + class_name1[0] + "2" + first_type).attr('fill', _this.stroke_color)
                            $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', _this.stroke_color)
                            $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', _this.stroke_color)
                            $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', _this.stroke_color)
                        })
                        .on('mouseleave', function () {
                            $('.co_tem' + stage + i + cor_temp[j][0]).attr("visibility", "hidden")
                            $(this).attr('stroke', _this.line_color)
                            let class_name = $(this).attr('class').split(' ')
                            let class_name1 = class_name[2]
                            let class_name2 = parseInt(class_name[3])
                            let first_type = (parseInt(class_name2 / 10) + 1).toString()
                            let second_type = ((class_name2 % 10) + 1).toString()
                            _this.active_passive = _this.removeElement(_this.active_passive, [class_name1[0] + first_type, class_name1[3] + second_type])
                            //console.log(".temporal." + stage + "." + class_name1[0]+first_type)
                            $(".temporal." + stage + "." + class_name1[0] + "2" + first_type).attr('fill', function () {
                                if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[0] + "2" + first_type)) {
                                    $(this).attr("fill", _this.comparison_color)
                                } else {
                                    $(this).attr("fill", _this.distribution_color)
                                }
                            })
                            $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', function () {
                                if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[3] + "2" + second_type)) {
                                    $(this).attr("fill", _this.comparison_color)
                                } else {
                                    $(this).attr("fill", _this.distribution_color)
                                }
                            })
                            $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', function () {
                                if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[0] + first_type)) {
                                    $(this).attr("fill", _this.comparison_color)
                                } else {
                                    $(this).attr("fill", _this.distribution_color)
                                }
                            })
                            $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', function () {
                                if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[3] + second_type)) {
                                    $(this).attr("fill", _this.comparison_color)
                                } else {
                                    $(this).attr("fill", _this.distribution_color)
                                }
                            })
                        })

                    svg2.append("path")
                        .datum(data1)
                        .attr("fill", "none")
                        .attr("stroke", _this.line_color)
                        .attr("stroke-width", function () {
                            if (j != 0) {
                                return 1
                            } else {
                                return 2
                            }
                        })
                        .attr("opacity", function () {
                            if (j != 0) {
                                return 0.3
                            } else {
                                return 0.5
                            }
                        })
                        .attr("d", lineGenerator)
                        .attr("class", "stage" + stage + " " + keys_c[i] + " " + cor_temp[j][0])
                        .on('mouseenter', function () {
                            $(this).attr('stroke', _this.stroke_color)
                            let class_name = $(this).attr('class').split(' ')
                            let class_name1 = class_name[1]
                            let class_name2 = parseInt(class_name[2])
                            let first_type = (parseInt(class_name2 / 10) + 1).toString()
                            let second_type = ((class_name2 % 10) + 1).toString()
                            _this.active_passive.push(class_name1[0] + first_type)
                            _this.active_passive.push(class_name1[3] + second_type)
                            $(".temporal." + stage + "." + class_name1[0] + "2" + first_type).attr('fill', _this.stroke_color)
                            $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', _this.stroke_color)
                            $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', _this.stroke_color)
                            $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', _this.stroke_color)
                        })
                        .on('mouseleave', function () {
                            $(this).attr('stroke', _this.line_color)
                            let class_name = $(this).attr('class').split(' ')
                            let class_name1 = class_name[1]
                            let class_name2 = parseInt(class_name[2])
                            let first_type = (parseInt(class_name2 / 10) + 1).toString()
                            let second_type = ((class_name2 % 10) + 1).toString()
                            _this.active_passive = _this.removeElement(_this.active_passive, [class_name1[0] + first_type, class_name1[3] + second_type])
                            //console.log(".temporal." + stage + "." + class_name1[0]+first_type)
                            $('.temporal.' + stage + '.' + stage + "." + class_name1[0] + first_type).attr('fill', function () {
                                if (_this.highlight_class.includes('.temporal.' + stage + '.' + stage + "." + class_name1[0] + first_type)) {
                                    $(this).attr("fill", _this.comparison_color)
                                } else {
                                    $(this).attr("fill", _this.distribution_color)
                                }
                            })
                            $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', function () {
                                if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[3] + "2" + second_type)) {
                                    $(this).attr("fill", _this.comparison_color)
                                } else {
                                    $(this).attr("fill", _this.distribution_color)
                                }
                            })
                            $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', function () {
                                if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[0] + first_type)) {
                                    $(this).attr("fill", _this.comparison_color)
                                } else {
                                    $(this).attr("fill", _this.distribution_color)
                                }
                            })
                            $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', function () {
                                if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[3] + second_type)) {
                                    $(this).attr("fill", _this.comparison_color)
                                } else {
                                    $(this).attr("fill", _this.distribution_color)
                                }
                            })
                        })

                }
            }
            //画三个一起出现的
            const height_curve_scale2 = d3.scaleLinear()
                .domain([80, 190])
                .range([15, 30])
            const border = 3
            for (let i = 0; i < cor_temp_keys.length; i++) {
                let cor_temp = parseInt(corr_statistics_all['de_ac_pa'][cor_temp_keys[i]][0])
                let temp0 = parseInt(cor_temp / 100).toString()
                let temp1 = parseInt((cor_temp - parseInt(temp0) * 100) / 10).toString()
                let temp2 = (cor_temp % 10).toString()
                let y0 = position['0' + temp0]
                let y1 = position['1' + temp1]
                let y2 = position['2' + temp2]
                let y_m = (y0 + y2) / 2
                let x_left = x_start1 - height_curve_scale2(y2 - y0)
                let x_right = x_start1 - 5
                let data = [
                    { x: x_right, y: y0 },
                    { x: x_left + border, y: y0 },
                    { x: x_left, y: y0 + border },
                    { x: x_left, y: y2 - border },
                    { x: x_left + border, y: y2 },
                    { x: x_right, y: y2 },
                ]
                //开始计算co-occurence出现的情况
                let corr_temporal = []
                for (let p = 0; p < corr_statistics.length; p++) {
                    let flag_temp = 0
                    for (let q = 0; q < corr_statistics[p]['de_ac_pa'].length; q++) {
                        if (corr_statistics[p]['de_ac_pa'][q][0] == cor_temp) {
                            flag_temp = 1
                            corr_temporal.push(corr_statistics[p][keys_c[i]][q][1])
                            break
                        }
                    }
                    if (flag_temp == 0) {
                        corr_temporal.push(0)
                    }
                }

                let yScale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([height_scale, 0])

                let area = d3.area()
                    .x(function (d) { return d.x })
                    .y0(height_scale)
                    .y1(function (d) { return yScale(d.y) })

                let temporal_temp = []
                let temporal_horizon = []

                for (let p = 0; p < corr_temporal.length; p++) {
                    temporal_temp.push(
                        { x: x_left + 5 + p * width_scale / data_statistics.length, y: corr_temporal[p] }
                    )
                    temporal_horizon.push(corr_temporal[p])
                }

                //开始画co-temporal
                let svg_t = svg2.append('g').attr("class", "3_co_tem" + stage + cor_temp).attr("visibility", "hidden")
                    .attr("transform", "translate(10, 0)")

                svg_t.append("rect")
                    .attr("x", x_left + 5)
                    .attr("y", (y0 + y2) / 2 + 5)
                    .attr("height", height_scale)
                    .attr("width", width_scale - 5)
                    .attr("fill", 'white')
                    .attr("class", "temporal")
                    .attr("stroke", "#5b5b5b")

                svg_t.append("rect")
                    .attr("x", x_left + 5)
                    .attr("y", (y0 + y2) / 2 + 5)
                    .attr("height", height_scale)
                    .attr("width", width_scale - 5)
                    .attr("fill", '#5b5b5b')
                    .attr("class", "temporal")
                    .attr("stroke", "black")
                    .attr("opacity", 0.05)

                let thresholds = [0.1, 0.2, 0.3, 0.4, 0.5]

                let yScale2 = d3.scaleLinear()
                    .domain([0, 0.1])
                    .range([height_scale, 0]);

                let areaGenerator = d3.area()
                    .x(function (d, i) { return x_start1 + i * (width_scale + 10) / data_statistics.length; })
                    .y0(height_scale)
                    .y1(function (d) { return yScale2(d); })
                    .curve(d3.curveBasis);

                let layers = _this.splitDataByThresholds(temporal_horizon, thresholds, 0.1)
                let svg_t_1 = svg_t.append('g')
                    .attr("transform", "translate(" + (x_left - 45) + "," + ((y0 + y2) / 2 + 5) + ")")

                svg_t_1.selectAll(".layer_co")
                    .data(layers)
                    .enter().append("path")
                    .attr("class", "layer")
                    .attr("d", areaGenerator)
                    .attr("opacity", function (d, i) { return (i + 1) * 0.3 })
                    .attr("fill", _this.cor_temporal_color)
                    .attr("class", "temporal")
                //.attr("visibility", "hidden")

                svg2.append("circle")
                    .attr("cx", x_left)
                    .attr("cy", (y0 + y2) / 2)
                    .attr("r", 3)
                    .attr("fill", _this.circle_color)
                    .attr("opacity", 0.5)
                    .attr("class", "temporal " + "stage" + stage + ' de_ac_pa ' + cor_temp)
                    .attr("visibility", "hidden")
                    .on('mouseenter', function () {
                        $(".3_co_tem" + stage + cor_temp).attr("visibility", "visable")
                        let class_name = $(this).attr('class').split(' ')
                        let class_name1 = class_name[2]
                        let class_name2 = parseInt(class_name[3])
                        $(".stage" + stage + "." + class_name1 + "." + class_name2).attr('stroke', _this.stroke_color)
                        let first_type = (parseInt(class_name2 / 100) + 1).toString()
                        let third_type = ((class_name2 % 10) + 1).toString()
                        let second_type = (parseInt((class_name2 - parseInt(class_name2 / 100) * 100) / 10) + 1).toString()
                        _this.active_passive.push(class_name1[0] + first_type)
                        _this.active_passive.push(class_name1[3] + second_type)
                        _this.active_passive.push(class_name1[6] + third_type)
                        $(".temporal." + stage + "." + class_name1[0] + "2" + first_type).attr('fill', _this.stroke_color)
                        $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', _this.stroke_color)
                        $(".temporal." + stage + "." + class_name1[6] + "2" + third_type).attr('fill', _this.stroke_color)
                        $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', _this.stroke_color)
                        $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', _this.stroke_color)
                        $(".non-temporal." + stage + "." + class_name1[6] + third_type).attr('fill', _this.stroke_color)
                    })
                    .on('mouseleave', function () {
                        $(".3_co_tem" + stage + cor_temp).attr("visibility", "hidden")
                        let class_name = $(this).attr('class').split(' ')
                        let class_name1 = class_name[2]
                        let class_name2 = parseInt(class_name[3])
                        $(".stage" + stage + "." + class_name1 + "." + class_name2).attr('stroke', _this.line_color)
                        let first_type = (parseInt(class_name2 / 100) + 1).toString()
                        let third_type = ((class_name2 % 10) + 1).toString()
                        let second_type = (parseInt((class_name2 - parseInt(class_name2 / 100) * 100) / 10) + 1).toString()
                        _this.active_passive = _this.removeElement(_this.active_passive, [class_name1[0] + first_type, class_name1[3] + second_type, class_name1[6] + third_type])
                        $(".temporal." + stage + "." + class_name1[0] + "2" + first_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[0] + "2" + first_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[3] + "2" + second_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".temporal." + stage + "." + class_name1[6] + "2" + third_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[6] + "2" + third_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[0] + first_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[3] + second_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".non-temporal." + stage + "." + class_name1[6] + third_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[6] + third_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                    })

                svg2.append("line")
                    .attr("x1", x_right)
                    .attr("x2", x_left)
                    .attr("y1", y1)
                    .attr("y2", (y0 + y2) / 2)
                    .attr("fill", "none")
                    .attr("stroke", _this.line_color)
                    .attr("stroke-width", function () {
                        if (i > 0) {
                            return 2
                        } else {
                            return 3
                        }
                    })
                    .attr("opacity", function () {
                        if (i > 0) {
                            return 0.3
                        } else {
                            return 0.5
                        }
                    })
                    .attr("class", "stage" + stage + ' de_ac_pa ' + cor_temp)
                    .on('mouseenter', function () {
                        let class_name = $(this).attr('class').split(' ')
                        let class_name1 = class_name[1]
                        let class_name2 = parseInt(class_name[2])
                        $(".stage" + stage + "." + class_name1 + "." + class_name2).attr('stroke', _this.stroke_color)
                        let first_type = (parseInt(class_name2 / 100) + 1).toString()
                        let third_type = ((class_name2 % 10) + 1).toString()
                        let second_type = (parseInt((class_name2 - parseInt(class_name2 / 100) * 100) / 10) + 1).toString()
                        _this.active_passive.push(class_name1[0] + first_type)
                        _this.active_passive.push(class_name1[3] + second_type)
                        _this.active_passive.push(class_name1[6] + third_type)
                        $(".temporal." + stage + "." + class_name1[0] + "2" + first_type).attr('fill', _this.stroke_color)
                        $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', _this.stroke_color)
                        $(".temporal." + stage + "." + class_name1[6] + "2" + third_type).attr('fill', _this.stroke_color)
                        $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', _this.stroke_color)
                        $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', _this.stroke_color)
                        $(".non-temporal." + stage + "." + class_name1[6] + third_type).attr('fill', _this.stroke_color)
                    })
                    .on('mouseleave', function () {
                        let class_name = $(this).attr('class').split(' ')
                        let class_name1 = class_name[1]
                        let class_name2 = parseInt(class_name[2])
                        $(".stage" + stage + "." + class_name1 + "." + class_name2).attr('stroke', _this.line_color)
                        let first_type = (parseInt(class_name2 / 100) + 1).toString()
                        let third_type = ((class_name2 % 10) + 1).toString()
                        let second_type = (parseInt((class_name2 - parseInt(class_name2 / 100) * 100) / 10) + 1).toString()
                        _this.active_passive = _this.removeElement(_this.active_passive, [class_name1[0] + first_type, class_name1[3] + second_type, class_name1[6] + third_type])
                        $(".temporal." + stage + "." + class_name1[0] + "2" + first_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[0] + "2" + first_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[3] + "2" + second_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".temporal." + stage + "." + class_name1[6] + "2" + third_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[6] + "2" + third_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[0] + first_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[3] + second_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".non-temporal." + stage + "." + class_name1[6] + third_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[6] + third_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                    })
                    .lower()

                svg2.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", _this.line_color)
                    .attr("stroke-width", function () {
                        if (i > 0) {
                            return 2
                        } else {
                            return 3
                        }
                    })
                    .attr("opacity", function () {
                        if (i > 0) {
                            return 0.3
                        } else {
                            return 0.5
                        }
                    })
                    .attr("d", lineGenerator)
                    .attr("class", "stage" + stage + ' de_ac_pa ' + cor_temp)
                    .on('mouseenter', function () {
                        let class_name = $(this).attr('class').split(' ')
                        let class_name1 = class_name[1]
                        let class_name2 = parseInt(class_name[2])
                        $(".stage" + stage + "." + class_name1 + "." + class_name2).attr('stroke', _this.stroke_color)
                        let first_type = (parseInt(class_name2 / 100) + 1).toString()
                        let third_type = ((class_name2 % 10) + 1).toString()
                        let second_type = (parseInt((class_name2 - parseInt(class_name2 / 100) * 100) / 10) + 1).toString()
                        _this.active_passive.push(class_name1[0] + first_type)
                        _this.active_passive.push(class_name1[3] + second_type)
                        _this.active_passive.push(class_name1[6] + third_type)
                        $(".temporal." + stage + "." + class_name1[0] + "2" + first_type).attr('fill', _this.stroke_color)
                        $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', _this.stroke_color)
                        $(".temporal." + stage + "." + class_name1[6] + "2" + third_type).attr('fill', _this.stroke_color)
                        $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', _this.stroke_color)
                        $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', _this.stroke_color)
                        $(".non-temporal." + stage + "." + class_name1[6] + third_type).attr('fill', _this.stroke_color)
                    })
                    .on('mouseleave', function () {
                        let class_name = $(this).attr('class').split(' ')
                        let class_name1 = class_name[1]
                        let class_name2 = parseInt(class_name[2])
                        $(".stage" + stage + "." + class_name1 + "." + class_name2).attr('stroke', _this.line_color)
                        let first_type = (parseInt(class_name2 / 100) + 1).toString()
                        let third_type = ((class_name2 % 10) + 1).toString()
                        let second_type = (parseInt((class_name2 - parseInt(class_name2 / 100) * 100) / 10) + 1).toString()
                        _this.active_passive = _this.removeElement(_this.active_passive, [class_name1[0] + first_type, class_name1[3] + second_type, class_name1[6] + third_type])
                        $(".temporal." + stage + "." + class_name1[0] + "2" + first_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[0] + "2" + first_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".temporal." + stage + "." + class_name1[3] + "2" + second_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[3] + "2" + second_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".temporal." + stage + "." + class_name1[6] + "2" + third_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".temporal." + stage + "." + class_name1[6] + "2" + third_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".non-temporal." + stage + "." + class_name1[0] + first_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[0] + first_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".non-temporal." + stage + "." + class_name1[3] + second_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[3] + second_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                        $(".non-temporal." + stage + "." + class_name1[6] + third_type).attr('fill', function () {
                            if (_this.highlight_class.includes(".non-temporal." + stage + "." + class_name1[6] + third_type)) {
                                $(this).attr("fill", _this.comparison_color)
                            } else {
                                $(this).attr("fill", _this.distribution_color)
                            }
                        })
                    })
                    .lower()
            }
        },
        drawLegend2() {
            const _this = this
            const svg = d3.select(".stageviewheader")
                .append("svg")
                .attr("width", 200)
                .attr("height", 20)

            let g_legend = svg.append('g')

            g_legend.append("rect")
                .attr("x", 13)
                .attr("y", 3)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", _this.depression_color)

            g_legend.append("text")
                .attr("x", 25)
                .attr("y", 12)
                .attr("font-size", 10)
                .text("depression")

            g_legend.append("rect")
                .attr("x", 83)
                .attr("y", 3)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", _this.active_color)

            g_legend.append("text")
                .attr("x", 95)
                .attr("y", 12)
                .attr("font-size", 10)
                .text("active")

            g_legend.append("rect")
                .attr("x", 130)
                .attr("y", 3)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", _this.passive_color)

            g_legend.append("text")
                .attr("x", 142)
                .attr("y", 12)
                .attr("font-size", 10)
                .text("passive")
            
        },
        drawStage2(stage, data, x_start, y_start, width, height, svg, active_number, passive_number, maxcor) {
            const _this = this
            var data_summary = new Array()
            var data_summary_all = { "depression": new Array(), "active behavior": new Array(), "passive behavior": new Array() } //用来包含所有的点
            var data_statistics = new Array()
            var data_statistics_all = new Array() //用来包含所有的点
            var segment_length = data.length
            var corr_statistics = new Array()
            var data_concat = new Array()
            var corr_statistics_all = new Array()
            for (let i = 0; i < segment_length; i++) {
                data_summary[i] = { "depression": new Array(), "active behavior": new Array(), "passive behavior": new Array() } //存储每一个时间点关于三个的统计
                data_statistics[i] = new Array()
                data_concat = data_concat.concat(data[i])
                for (let j = 0; j < data[i].length; j++) {
                    data_summary[i]["depression"].push(_this.depressionThreshold(data[i][j][0]))
                    data_summary[i]["active behavior"].push(data[i][j][1])
                    data_summary[i]["passive behavior"].push(data[i][j][2])
                    data_summary_all["depression"].push(_this.depressionThreshold(data[i][j][0]))
                    data_summary_all["active behavior"].push(data[i][j][1])
                    data_summary_all["passive behavior"].push(data[i][j][2])
                }
                corr_statistics.push(_this.correlationSummarize(data[i], maxcor))
                data_statistics[i].push(
                    _this.getFrequency(data_summary[i]["depression"]),
                    _this.getFrequency(data_summary[i]["active behavior"]),
                    _this.getFrequency(data_summary[i]["passive behavior"])
                )
            }
            corr_statistics_all = _this.correlationSummarize(data_concat, maxcor)
            data_statistics_all.push(
                _this.getFrequency(data_summary_all["depression"]),
                _this.getFrequency(data_summary_all["active behavior"]),
                _this.getFrequency(data_summary_all["passive behavior"])
            )

            var svg_new = svg.append('g')
                .attr('width', 100)
                .attr('height', 100)
                .attr('class', 'stage ' + stage)

            //画seperate frequency
            var x_start_temp = x_start + 54
            var y_start_temp = y_start + height / 4
            var height_temp = 50
            var width_temp = 50

            const scale_height = 25

            //画correlation
            var line = d3.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .curve(d3.curveBasis)

            const fre_scale = d3.scaleLog()
                .domain([0.1, 1])
                .range([1, 4])

            for (let i = 0; i < 1; i++) {
                //加入depression-active的数据
                for (let j = 0; j < corr_statistics_all['de_ac'].length; j++) {
                    let data_vis = []
                    let active_label = corr_statistics_all['de_ac'][j][0] % 10
                    let depression_label = Math.floor(corr_statistics_all['de_ac'][j][0] / 10)
                    let frequency = corr_statistics_all['de_ac'][j][1]
                    data_vis.push({
                        'x': x_start_temp + depression_label * (width_temp / 4) + 7,
                        'y': y_start_temp,
                        'value': frequency,
                    })
                    data_vis.push({
                        'x': x_start_temp,
                        'y': y_start + height / 4 + active_label * height_temp / active_number + 2 + Math.floor((height_temp - 2 * active_number + 2) / active_number) / 2,
                        'value': frequency
                    })
                    svg_new.append("path")
                        .datum(data_vis)
                        .attr("fill", "none")
                        .attr("stroke", _this.cor_color)
                        .attr("stroke-width", fre_scale(frequency))
                        .attr("d", line)
                        .attr("opacity", 0.6)
                }
                //加入depression-passive的数据
                for (let j = 0; j < corr_statistics_all['de_pa'].length; j++) {
                    let data_vis = []
                    let passive_label = corr_statistics_all['de_pa'][j][0] % 10
                    let depression_label = Math.floor(corr_statistics_all['de_pa'][j][0] / 10)
                    let frequency = corr_statistics_all['de_pa'][j][1]
                    data_vis.push({
                        'x': x_start_temp + depression_label * (width_temp / 4) + 7,
                        'y': y_start_temp,
                        'value': frequency,
                    })
                    data_vis.push({
                        'x': x_start_temp + width_temp,
                        'y': y_start + height / 4 + passive_label * height_temp / passive_number + 2 + Math.floor((height_temp - 2 * passive_number + 2) / passive_number) / 2,
                        'value': frequency
                    })
                    svg_new.append("path")
                        .datum(data_vis)
                        .attr("fill", "none")
                        .attr("stroke", _this.cor_color)
                        .attr("stroke-width", fre_scale(frequency))
                        .attr("d", line)
                        .attr("opacity", 0.6)
                }
                //加入active-passive的数据
                for (let j = 0; j < corr_statistics_all['ac_pa'].length; j++) {
                    let data_vis = []
                    let passive_label = corr_statistics_all['ac_pa'][j][0] % 10
                    //console.log(passive_label)
                    let active_label = Math.floor(corr_statistics_all['ac_pa'][j][0] / 10)
                    let frequency = corr_statistics_all['ac_pa'][j][1]
                    data_vis.push({
                        'x': x_start_temp,
                        'y': y_start + height / 4 + active_label * height_temp / active_number + 2 + Math.floor((height_temp - 2 * active_number + 2) / active_number) / 2,
                        'value': frequency,
                    })
                    data_vis.push({
                        'x': x_start_temp + width_temp,
                        'y': y_start + height / 4 + passive_label * height_temp / passive_number + 2 + Math.floor((height_temp - 2 * passive_number + 2) / passive_number) / 2,
                        'value': frequency
                    })
                    svg_new.append("path")
                        .datum(data_vis)
                        .attr("fill", "none")
                        .attr("stroke", _this.cor_color)
                        .attr("stroke-width", fre_scale(frequency))
                        .attr("d", line)
                        .attr("opacity", 0.6)
                }
                //console.log(data_vis)
                //加入depression-active-passive的数据
                for (let j = 0; j < corr_statistics_all['de_ac_pa'].length; j++) {
                    let data_vis = []
                    let passive_label = corr_statistics_all['de_ac_pa'][j][0] % 10
                    let left = (corr_statistics_all['de_ac_pa'][j][0] - passive_label) / 10
                    let active_label = left % 10
                    let depression_label = Math.floor(left / 10)
                    let frequency = corr_statistics_all['de_ac_pa'][j][1]
                    //加入depression
                    data_vis.push({
                        'x': x_start_temp + depression_label * (width_temp / 4) + 7,
                        'y': y_start_temp,
                        'value': frequency,
                    })
                    //加入active
                    data_vis.push({
                        'x': x_start_temp,
                        'y': y_start + height / 4 + active_label * height_temp / active_number + 2 + Math.floor((height_temp - 2 * active_number + 2) / active_number) / 2,
                        'value': frequency
                    })
                    //加入passive
                    data_vis.push({
                        'x': x_start_temp + width_temp,
                        'y': y_start + height / 4 + passive_label * height_temp / passive_number + 2 + Math.floor((height_temp - 2 * passive_number + 2) / passive_number) / 2,
                        'value': frequency
                    })
                    //加入depression
                    data_vis.push({
                        'x': x_start_temp + depression_label * (width_temp / 4) + 7,
                        'y': y_start_temp,
                        'value': frequency,
                    })
                    svg_new.append("path")
                        .datum(data_vis)
                        .attr("fill", "none")
                        .attr("stroke", "black")
                        .attr("stroke-width", fre_scale(frequency))
                        .attr("d", line)
                        .attr("opacity", 0.2)
                }
            }

            for (let i = 0; i < 1; i++) {
                //画depression的注释
                svg_new.append("line")
                    .attr("x1", x_start_temp - 10)
                    .attr("x2", x_start_temp + width_temp + 10)
                    .attr("y1", y_start)
                    .attr("y2", y_start)
                    .attr("stroke", _this.normal_color)
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.2)

                svg_new.append("text")
                    .attr("x", x_start_temp - 28)
                    .attr("y", y_start + 2)
                    .attr("font-size", 10)
                    .text("low")

                svg_new.append("text")
                    .attr("x", x_start_temp + width_temp + 13)
                    .attr("y", y_start + 2)
                    .attr("font-size", 10)
                    .text("high")

                //画depression的分布
                for (let j = 0; j < 4; j++) {
                    //查看是否存在这个key,如果不存在则这个长度为0
                    let key_temp = Object.keys(data_statistics_all[0])
                    let value_temp = Object.values(data_statistics_all[0])
                    let height_depression = 0
                    if (key_temp.includes(j.toString())) {
                        height_depression = scale_height * data_statistics_all[0][j] / _this.sum(value_temp)
                    }
                    if (data_statistics_all[0][j] / _this.sum(value_temp) > 0.1) {
                        svg_new.append("line")
                            .attr("x1", x_start_temp + j * (width_temp / 4) + 7)
                            .attr("x2", x_start_temp + j * (width_temp / 4) + 7)
                            .attr("y1", y_start + height / 4 - height_depression)
                            .attr("y2", y_start)
                            .attr("stroke", _this.normal_color)
                            .attr("stroke-width", 1)
                            .attr("stroke-dasharray", "3, 2")
                    }
                    svg_new.append("rect")
                        .attr("x", x_start_temp + j * (width_temp / 4) + 2)
                        .attr("y", y_start + height / 4 - height_depression)
                        .attr("fill", _this.depression_color)
                        .attr("width", 10)
                        .attr("height", height_depression)
                }

                //画active的注释
                svg_new.append("line")
                    .attr("x1", x_start_temp - scale_height)
                    .attr("x2", x_start_temp - scale_height)
                    .attr("y1", y_start + height / 4 - 5)
                    .attr("y2", y_start + height / 4 + height_temp + 5)
                    .attr("stroke", _this.normal_color)
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.2)

                //画active behavior
                for (let j = 0; j < active_number; j++) {
                    //查看是否存在这个key,如果不存在则这个长度为0
                    let key_temp = Object.keys(data_statistics_all[1])
                    let value_temp = Object.values(data_statistics_all[1])
                    let height_active = 0
                    if (key_temp.includes(j.toString())) {
                        height_active = scale_height * data_statistics_all[1][j] / _this.sum(value_temp)
                    }
                    if (data_statistics_all[1][j] / _this.sum(value_temp) > 0.1) {
                        svg_new.append("line")
                            .attr("x1", x_start_temp - scale_height)
                            .attr("x2", x_start_temp - height_active)
                            .attr("y1", y_start + height / 4 + j * height_temp / active_number + 2 + Math.floor((height_temp - 2 * active_number + 2) / active_number) / 2)
                            .attr("y2", y_start + height / 4 + j * height_temp / active_number + 2 + Math.floor((height_temp - 2 * active_number + 2) / active_number) / 2)
                            .attr("stroke", _this.normal_color)
                            .attr("stroke-width", 1)
                            .attr("stroke-dasharray", "3, 2")

                        svg_new.append("text")
                            .attr("x", x_start_temp - scale_height - 13)
                            .attr("y", y_start + height / 4 + j * height_temp / active_number + 5 + Math.floor((height_temp - 2 * active_number + 2) / active_number) / 2)
                            .attr("font-size", 10)
                            .text("p" + (j + 1))
                    }
                    svg_new.append("rect")
                        .attr("x", x_start_temp - height_active)
                        .attr("y", y_start + height / 4 + j * height_temp / active_number + 2)
                        .attr("fill", _this.active_color)
                        .attr("width", height_active)
                        .attr("height", Math.floor((height_temp - 2 * active_number + 2) / active_number))
                }
                //画passive的注释
                svg_new.append("line")
                    .attr("x1", x_start_temp + width_temp + scale_height)
                    .attr("x2", x_start_temp + width_temp + scale_height)
                    .attr("y1", y_start + height / 4 - 5)
                    .attr("y2", y_start + height / 4 + height_temp + 5)
                    .attr("stroke", _this.normal_color)
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.2)

                //画passive behavior
                for (let j = 0; j < passive_number; j++) {
                    //查看是否存在这个key,如果不存在则这个长度为0
                    let key_temp = Object.keys(data_statistics_all[2])
                    let value_temp = Object.values(data_statistics_all[2])
                    let height_passive = 0
                    if (key_temp.includes(j.toString())) {
                        height_passive = scale_height * data_statistics_all[2][j] / _this.sum(value_temp)
                    }
                    if (data_statistics_all[2][j] / _this.sum(value_temp) > 0.1) {
                        svg_new.append("line")
                            .attr("x1", x_start_temp + width_temp)
                            .attr("x2", x_start_temp + width_temp + scale_height)
                            .attr("y1", y_start + height / 4 + j * height_temp / passive_number + 2 + Math.floor((height_temp - 2 * passive_number + 2) / passive_number) / 2)
                            .attr("y2", y_start + height / 4 + j * height_temp / passive_number + 2 + Math.floor((height_temp - 2 * passive_number + 2) / passive_number) / 2)
                            .attr("stroke", _this.normal_color)
                            .attr("stroke-width", 1)
                            .attr("stroke-dasharray", "3, 2")

                        svg_new.append("text")
                            .attr("x", x_start_temp + width_temp + scale_height + 2)
                            .attr("y", y_start + height / 4 + j * height_temp / passive_number + 5 + Math.floor((height_temp - 2 * passive_number + 2) / passive_number) / 2)
                            .attr("font-size", 10)
                            .text("p" + (j + 1))
                    }
                    svg_new.append("rect")
                        .attr("x", x_start_temp + width_temp)
                        .attr("y", y_start + height / 4 + j * height_temp / passive_number + 2)
                        .attr("fill", _this.passive_color)
                        .attr("width", height_passive)
                        .attr("height", Math.floor((height_temp - 2 * passive_number + 2) / passive_number))
                }

                // 画中间的连接方块区域
                svg_new.append("rect")
                    .attr("x", x_start_temp)
                    .attr("y", y_start_temp)
                    .attr("fill", "none")
                    .attr("width", height_temp)
                    .attr("height", width_temp)
                    .attr("stroke", _this.normal_color)
                    .attr("stroke-width", 2)
                    .attr("opacity", 0.3)
            }
        },
        depressionThreshold(depression) {
            if (depression <= 1) {
                return 0
            } else if (depression <= 2) {
                return 1
            } else {
                return 2
            }
        },
        getFrequency(arr) {
            var obj = {};
            for (var i = 0, l = arr.length; i < l; i++) {
                var item = arr[i];
                obj[item] = (obj[item] + 1) || 1;
            }
            return obj
        },
        sum(arr) {
            var len = arr.length;
            if (len == 0) {
                return 0;
            } else if (len == 1) {
                return arr[0];
            } else {
                return arr[0] + this.sum(arr.slice(1));
            }
        },
        dictSum(dict) {
            let temp = Object.keys(dict)
            let sum = 0
            for (let t of temp) {
                sum += dict[t]
            }
            return sum
        },
        removeElement(list, r_list) {
            const arr1 = list
            const arr2 = r_list
            const count = new Map()
            for (const n of arr1) {
                count.set(n, (count.get(n) || 0) + 1);
            }
            for (const n of arr2) {
                count.set(n, (count.get(n) || 0) - 1);
            }
            const result = [];
            for (const [n, c] of count.entries()) {
                for (let i = 0; i < c; i++) {
                    result.push(n);
                }
            }
            return result
        },
        correlationSummarize(data, n) {
            const _this = this
            var de_ac = new Array()
            var de_pa = new Array()
            var ac_pa = new Array()
            var de_ac_pa = new Array()
            for (let i = 0; i < data.length; i++) {
                let depression = _this.depressionThreshold(data[i][0])
                let activeb = data[i][1]
                let passiveb = data[i][2]
                de_ac.push(depression * 10 + activeb)
                de_pa.push(depression * 10 + passiveb)
                ac_pa.push(activeb * 10 + passiveb)
                de_ac_pa.push(depression * 100 + 10 * activeb + passiveb)
            }
            de_ac = _this.getFrequency(de_ac)
            de_pa = _this.getFrequency(de_pa)
            ac_pa = _this.getFrequency(ac_pa)
            de_ac_pa = _this.getFrequency(de_ac_pa)
            var result = { "de_ac": _this.maxnObtain(de_ac, n), "de_pa": _this.maxnObtain(de_pa, n), "ac_pa": _this.maxnObtain(ac_pa, n), "de_ac_pa": _this.maxnObtain(de_ac_pa, n) }
            return result
        },
        maxnObtain(dict, n) {
            const _this = this
            const items = Object.keys(dict).map(function (key) {
                return [key, dict[key]];
            });

            // 按照 value 的大小进行排序
            items.sort(function (first, second) {
                return second[1] - first[1];
            });

            const sum_values = _this.sum(Object.values(dict))

            // 获取排序后的前 n 个 key 值
            const result = [];
            for (let i = 0; i < n; i++) {
                result.push([items[i][0], items[i][1] / sum_values]);
            }
            return result
        }
    }
}