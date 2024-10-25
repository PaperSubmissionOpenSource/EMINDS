import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as d3 from 'd3'
import $ from 'jquery'
import { sliderBottom, sliderLeft } from 'd3-simple-slider'

export default {
    name: 'StatisticsView',
    components: {
    },
    props: {
    },
    computed: {
    },
    data() {
        return {
            stroke_color: "#D1B24D",
            normal_color: '#5b5b5b',
            slider_color: '#C9CBD1',
            //better_color: '#5b5b5b',
            //worse_color: '#c9c9c9',
            better_color: '#ADC2BC',
            worse_color: '#f5cac3',
            path_data: new Array(),
            pattern_data: new Array(),
            start_flag: 0,
            //color_list: ["#B6B6C6", "#ADB9C1", "#AFB5A4", "#EFE8BD", "#e9d1b4", "#d2aaa3"],
            color_list: ["#768f89", "#adb49f", "#EFE8BD", "#e9d1b4", "#ddbcab", "#d2aaa3"],
            // color_list:["#B5B5C5", "#E2C9B3", "#ECC0C0", "#CAD5C3", "#9CB8CD", "#E3C6A9"],
            click_pattern: '',
            start: "0",
            end: "0",
            sort: "0",
            type: "0",
            stage_num: 6,
            stage_reorder: [],
            pattern_threshold: 0.1
        }
    },
    watch: {
        start: function(){
            const _this = this
            //console.log("start", _this.start)
            let start_temp = -1
            let end_temp = -1
            if (_this.start != '0') {
                start_temp = parseInt(_this.start.split(' ')[1]) - 1
            }
            if (_this.end != '0') {
                end_temp = parseInt(_this.end.split(' ')[1]) - 1
            }
            const rule = [start_temp, end_temp, parseInt(_this.type), parseInt(_this.sort)]
            $(".patternresult").remove()
            $(".pattern").remove()
            $(".path").remove()
            _this.drawFrequentPattern(6, _this.pattern_data, _this.path_data, rule) //需要从前面传stage_number
            d3.select(".prompt_4").raise()
        },
        end: function(){
            const _this = this
            console.log("end", _this.end)
            let start_temp = -1
            let end_temp = -1
            if (_this.start != '0') {
                start_temp = parseInt(_this.start.split(' ')[1]) - 1
            }
            if (_this.end != '0') {
                end_temp = parseInt(_this.end.split(' ')[1]) - 1
            }
            const rule = [start_temp, end_temp, parseInt(_this.type), parseInt(_this.sort)]
            $(".patternresult").remove()
            $(".pattern").remove()
            $(".path").remove()
            _this.drawFrequentPattern(_this.stage_num, _this.pattern_data, _this.path_data, rule) //需要从前面传stage_number
            d3.select(".prompt_4").raise()
        },
        type: function(){
            const _this = this
            console.log("type", _this.type)
            let start_temp = -1
            let end_temp = -1
            if (_this.start != '0') {
                start_temp = parseInt(_this.start.split(' ')[1]) - 1
            }
            if (_this.end != '0') {
                end_temp = parseInt(_this.end.split(' ')[1]) - 1
            }
            const rule = [start_temp, end_temp, parseInt(_this.type), parseInt(_this.sort)]
            $(".patternresult").remove()
            $(".pattern").remove()
            $(".path").remove()
            _this.drawFrequentPattern(_this.stage_num, _this.pattern_data, _this.path_data, rule) //需要从前面传stage_number
            d3.select(".prompt_4").raise()
        },
        sort: function(){
            const _this = this
            console.log("sort", _this.sort)
            let start_temp = -1
            let end_temp = -1
            if (_this.start != '0') {
                start_temp = parseInt(_this.start.split(' ')[1]) - 1
            }
            if (_this.end != '0') {
                end_temp = parseInt(_this.end.split(' ')[1]) - 1
            }
            const rule = [start_temp, end_temp, parseInt(_this.type), parseInt(_this.sort)]
            $(".patternresult").remove()
            $(".pattern").remove()
            $(".path").remove()
            _this.drawFrequentPattern(_this.stage_num, _this.pattern_data, _this.path_data, rule) //需要从前面传stage_number-
            d3.select(".prompt_4").raise()
        },
        start_flag: function () {
            const _this = this
            const rule = [parseInt(_this.start.split(' ')[1]) - 1, parseInt(_this.end.split(' ')[1]) - 1, parseInt(_this.type), parseInt(_this.sort)]
            if (_this.start_flag == 2) {
                _this.start_flag = 0
                _this.drawFrequentPattern(_this.stage_num, _this.pattern_data, _this.path_data, [-1, -1, 0, 0]) //需要从前面传stage_number
            }
            d3.select(".prompt_4").raise()
        },
        click_pattern: function () {
            const _this = this
            if (_this.click_pattern != 'none') {
                pipeService.emitClickPath([_this.click_pattern, _this.path_data])
            } else {
                $('.clickhighlight').attr('visibility', 'hidden')
            }
            d3.select(".prompt_4").raise()
        }

    },
    mounted: function () {
        const _this = this
        const svg = d3.select(".patternviewdisplay")
            .append("svg")
            .attr("width", 240)
            .attr("height", 2000)
            .attr("class", "patternview")

        _this.drawLegend()
        _this.drawSortLegend(6) //需要从前面传stage_number
        _this.drawResultTitle()

        let g_prompt = svg.append('g')
        .attr("class", "prompt_4")
        .attr("visibility", "hidden")
        .attr("transform", "translate(5, 40)")

        let rect = g_prompt.append('rect')
            .attr('width', 225)  
            .attr('height', 165)  
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
            .text('The first element in each row: ')
            .attr('x', 10) 
            .attr('y', 20) 
        
        text.append('tspan')
            .text('  - the stage order within the pattern.')
            .attr('x', 10) 
            .attr('y', 35) 

        text.append('tspan')
            .text('The second element in each row: ')
            .attr('x', 10) 
            .attr('y', 55) 
        
        text.append('tspan')
            .text('  - the frequency of the pattern')
            .attr('x', 10) 
            .attr('y', 70) 
        
        text.append('tspan')
            .text('The third element in each row: ')
            .attr('x', 10) 
            .attr('y', 95) 
        
        text.append('tspan')
            .text('  - the changes in the positive')
            .attr('x', 10) 
            .attr('y', 110) 
        text.append('tspan')
            .text('  and negative degrees of behavior ')
            .attr('x', 13) 
            .attr('y', 125) 
        text.append('tspan')
            .text(' sequences before and after')
            .attr('x', 16) 
            .attr('y', 140) 
        text.append('tspan')
            .text(' this stage pattern.')
            .attr('x', 13) 
            .attr('y', 155) 

        pipeService.onPattern(function (data) {
            //console.log('******statistics:onPattern******', data)
            const data_map = [_this.dicMap(data[0]), _this.listMap(data[1])]
            _this.pattern_data = data_map
            _this.start_flag = _this.start_flag + 1
            g_prompt.raise()
        })
        pipeService.onPath(function (data) {
            const data_map = _this.dicMap(data)
            _this.path_data = data_map
            _this.start_flag = _this.start_flag + 1
            g_prompt.raise()
        })
        pipeService.onPatternNone(function (data) {
            _this.click_pattern = "none"
            g_prompt.raise()
        })
    },
    methods: {
        number2literalMap(stage){
            if (stage == 0) {
                return 'a'
            }
            if (stage == 1) {
                return 'b'
            }
            if (stage == 2) {
                return 'c'
            }
            if (stage == 3) {
                return 'd'
            }
            if (stage == 4) {
                return 'e'
            } 
            if (stage == 5) {
                return 'f'
            }
        },
        listMap(lst) {
            const _this = this
            let result = []
            for (let i = 0; i < lst.length; i++) {
                let temp_t = lst[i]
                let temp_n = ''
                for (let j = 0; j < temp_t.length; j++) {
                    temp_n += _this.stageMap(parseInt(temp_t[j])).toString()
                }
                result.push(temp_n)
            }
            return result
        },
        dicMap(dic) {
            const _this = this
            let keys = Object.keys(dic)
            const result = {}
            for (let i = 0; i < keys.length; i++) {
                let k_t = keys[i]
                let k_n = ''
                for (let j = 0; j < k_t.length; j++) {
                    k_n += _this.stageMap(parseInt(k_t[j])).toString()
                }
                result[k_n] = dic[k_t]
            }
            return result
        },
        stageMap(stage) {
            if (stage == 0) {
                return 2
            }
            if (stage == 1) {
                return 4
            }
            if (stage == 2) {
                return 0
            }
            if (stage == 3) {
                return 1
            }
            if (stage == 4) {
                return 3
            } 
            if (stage == 5) {
                return 5
            }
        },
        drawResultTitle() {
            // 写legend
            var svg_s = d3.select(".patternviewresult")
                .append("svg")
                .attr("width", 240)
                .attr("height", 25)
            svg_s.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 236)
                .attr("height", 23)
                .attr("fill", "#5b5b5b")
                .attr("opacity", 0.1)

            svg_s.append("text")
                .attr("x", 67)
                .attr("y", 17)
                .attr("font-size", 16)
                .text("pattern result")
                .attr("fill", "black")
        },
        drawSortLegend(stage_number) {
            const _this = this
            // 定义color map
            const domain_x = []
            for (let i = 0; i < stage_number; i++) {
                domain_x.push(i)
            }
            const color = d3.scaleOrdinal()
                .domain(domain_x)
                .range(_this.color_list)

            // 写selection
            var svg_s = d3.select("#selection")
                .append("svg")
                .attr("width", 240)
                .attr("height", 25)
            svg_s.append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 236)
                .attr("height", 23)
                .attr("fill", "#5b5b5b")
                .attr("opacity", 0.1)

            svg_s.append("text")
                .attr("x", 55)
                .attr("y", 17)
                .attr("font-size", 16)
                .text("selection pannel")
                .attr("fill", "black")
            // 写title
            var svg_title = d3.select("#title")
                .append("svg")
                .attr("width", 200)
                .attr("height", 100)
            svg_title.append("text")
                .attr("x", 2)
                .attr("y", 17)
                .attr("font-size", 15)
                .text("start stage:")
                .attr("fill", "black")
            svg_title.append("text")
                .attr("x", 2)
                .attr("y", 42)
                .attr("font-size", 15)
                .text("end stage:")
                .attr("fill", "black")
            svg_title.append("text")
                .attr("x", 2)
                .attr("y", 67)
                .attr("font-size", 15)
                .text("frequency type:")
                .attr("fill", "black")
            svg_title.append("text")
                .attr("x", 2)
                .attr("y", 92)
                .attr("font-size", 15)
                .text("sort rule:")
                .attr("fill", "black")

            // 定义选项数据
            const data1 = [{ value: 0, label: "none", color: "none" }]
            for (let i = 0; i < stage_number; i++) {
                data1.push({ value: (i + 1), label: "stage " + (i + 1), color: color(i) })
            }

            // 画stage选择
            var select = d3.select("#start")
            for (let i = 0; i < 2; i++) {
                if (i == 1) {
                    select = d3.select("#end")
                }
                // 绑定数据到<option>标签上
                var options = select.selectAll("option")
                    .data(data1)
                    .enter()
                    .append("option")
                    .text(function (d) { return d; });

                options = select.selectAll("option")
                    .data(data1);

                // 移除旧的<option>标签
                options.exit().remove();

                // 添加新的<option>标签
                options.enter()
                    .append("option")
                    .text(function (d) { return d.label; })

                // 更新现有的<option>标签的文本
                options.text(function (d) { return d.label; });
            }
        },
        drawLegend() {
            const _this = this
            const svg = d3.select(".patternviewheader")
                .append("svg")
                .attr("width", 132)
                .attr("height", 20)
                .attr("transform", "translate(0, 0)")

            let g_legend = svg.append('g')

            g_legend.append("rect")
                .attr("x", 7)
                .attr("y", 3)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", _this.better_color)

            g_legend.append("text")
                .attr("x", 19)
                .attr("y", 12)
                .attr("font-size", 13)
                .text("group1")

            g_legend.append("rect")
                .attr("x", 64)
                .attr("y", 3)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", _this.worse_color)

            g_legend.append("text")
                .attr("x", 76)
                .attr("y", 12)
                .attr("font-size", 13)
                .text("group2")
            
            g_legend.append("circle")
                .attr("cx", 126)
                .attr("cy", 7)
                .attr("r", 5)
                .attr("fill", "white")
                .attr("stroke", "red")
                .on("mouseover", function () {
                    $(".prompt_4").attr("visibility", "visible");
                })
                .on("mouseout", function () {
                    $(".prompt_4").attr("visibility", "hidden");
                });
            
            g_legend.append("text")
                .attr("x", 123)
                .attr("y", 10)
                .attr("font-size", 8)
                .text("?")
                .attr("fill", "#bc4b51")
                .on("mouseover", function () {
                    $(".prompt_4").attr("visibility", "visible");
                })
                .on("mouseout", function () {
                    $(".prompt_4").attr("visibility", "hidden");
                });
        },
        drawFrequentPattern(stage_num, data, path_data, rule) {
            const _this = this
            const start_stage = rule[0]
            const end_stage = rule[1]
            const type = rule[2]
            const sort = rule[3]
            console.log(start_stage, end_stage, type, sort)
            // 开始一步一步过滤
            // 第一步：检查是否有确定的start stage
            let data_temp = [data[0], []]
            if (start_stage >= 0) {
                for (let i = 0; i < data[1].length; i++) {
                    if (data[1][i][0] == start_stage.toString()){
                        data_temp[1].push(data[1][i])
                    }
                }
                data = data_temp
            }
            // 第二步：检查是否有确定的end stage
            data_temp = [data[0], []]
            if (end_stage >= 0) {
                for (let i = 0; i < data[1].length; i++) {
                    if (data[1][i][data[1][i].length-1] == end_stage.toString()){
                        data_temp[1].push(data[1][i])
                    }
                }
                data = data_temp
            }
            // 第三步：查看想用什么value去排序
            let data_sort = []
            if (type == 0) {
                // 根据总出现频率排序
                for (let i = 0; i < data[1].length; i++) {
                    //console.log(data[0][data[1][i]][0] + data[0][data[1][i]][1])
                    data_sort.push([data[1][i], data[0][data[1][i]][0] + data[0][data[1][i]][1]])
                }
            } else if (type == 1) {
                // 根据positive的程度排序
                for (let i = 0; i < data[1].length; i++) {
                    data_sort.push([data[1][i], data[0][data[1][i]][0] - data[0][data[1][i]][1]])
                }
            } else if (type == 2) {
                // 根据negative的程度排序
                for (let i = 0; i < data[1].length; i++) {
                    data_sort.push([data[1][i], data[0][data[1][i]][1] - data[0][data[1][i]][0]])
                }
            } else if (type == 3) {
                for (let i = 0; i < data[1].length; i++) {
                    data_sort.push([data[1][i], path_data[data[1][i]][1][0] - path_data[data[1][i]][0][0]])
                }
            } else {
                for (let i = 0; i < data[1].length; i++) {
                    data_sort.push([data[1][i], path_data[data[1][i]][1][1] - path_data[data[1][i]][0][1]])
                }
            }
            // 第四步：查看是升序还是降序
            if (sort == 1) {
                data_sort.sort((a, b) => a[1] - b[1])
            } else {
                data_sort.sort((a, b) => b[1] - a[1])
            }
            data = [data[0], []]
            for (let i = 0; i < data_sort.length; i++) {
                data[1].push(data_sort[i][0])
            }
            const domain_x = []
            for (let i = 0; i < stage_num; i++) {
                domain_x.push(i)
            }
            const color = d3.scaleOrdinal()
                .domain(domain_x)
                .range(_this.color_list)
            const x_scale = d3.scaleLinear()
                .range([10, 150])
                .domain([0, 5])
            const y_scale = d3.scaleLinear()
                .range([20, 250])
                .domain([0, 10])

            const svg = d3.select(".patternview")

            // svg.append("text")
            //     .attr("x", 5)
            //     .attr("y", 12)
            //     .attr("font-size", 15)
            //     .text("threshold")

            // // 中间加一个冒号
            // svg.append("text")
            //     .attr("x", 66)
            //     .attr("y", 12)
            //     .attr("font-size", 15)
            //     .text(":")

            // //现在选择的k值是多少
            // svg.append("text")
            //     .attr("x", 70)
            //     .attr("y", 12)
            //     .attr("font-size", 15)
            //     .text(_this.pattern_threshold)
            //     .attr("class", "threshold")

            // const slider = sliderBottom()
            //     .ticks(0)
            //     .min(0).max(1)
            //     .step(0.05).width(100)
            //     .handle(d3.symbol().type(d3.symbolCircle).size(100)())
            //     .displayValue(false)
            //     .on('onchange', (value) => {
            //         _this.pattern_threshold = value
            //     }
            //     )
            //     .default(0.1)
            //     .fill([_this.slider_color])

            const g = svg
                .append('g')
                .attr('transform', "translate(100, 7)");

            // g.call(slider)

            for (let i = 0; i < data[1].length; i++) {
                let key = data[1][i]
                //存储勾选背景，最开始的时候背景是hidden的，选中了之后才会visible
                var g_highlight = svg.append('g').attr("class", "patternresult")

                g_highlight.append("rect")
                    .attr("x", 0)
                    .attr("y", y_scale(i) - 10)
                    .attr('width', 220)
                    .attr('height', 20)
                    .attr('fill', _this.stroke_color)
                    .attr('opacity', 0.1)
                    .attr('visibility', 'hidden')
                    .attr('class', 'clickhighlight ' + key)

                //存储后面的路径转移
                var g_temp_path = svg.append('g')
                    .attr('width', 240)
                    .attr('height', 1000)
                    .attr('class', 'path ' + key)
                    .on("click", function () {
                        if (_this.click_pattern != '') {
                            $(".clickhighlight." + _this.click_pattern.toString()).attr('visibility', 'hidden')
                        }
                        _this.click_pattern = key
                        $(".clickhighlight." + key).attr('visibility', 'visable')
                    })
                var good_f = path_data[key][0][0]
                var bad_f = path_data[key][0][1]
                var good_l = path_data[key][1][0]
                var bad_l = path_data[key][1][1]
                const height_path = 20
                g_temp_path.append('rect')
                    .attr("x", 200)
                    .attr("y", y_scale(i) - 10)
                    .attr("fill", _this.better_color)
                    .attr("stroke", 'none')
                    .attr("stroke-width", 0)
                    .attr("width", 10)
                    .attr("height", height_path * good_f)
                    .attr("opacity", 1)

                g_temp_path.append('rect')
                    .attr("x", 200)
                    .attr("y", y_scale(i) - 10 + height_path * good_f)
                    .attr("fill", _this.worse_color)
                    .attr("stroke", 'none')
                    .attr("stroke-width", 0)
                    .attr("width", 10)
                    .attr("height", height_path * bad_f)
                    .attr("opacity", 1)

                g_temp_path.append('rect')
                    .attr("x", 210)
                    .attr("y", y_scale(i) - 10)
                    .attr("fill", _this.better_color)
                    .attr("stroke", 'none')
                    .attr("stroke-width", 0)
                    .attr("width", 10)
                    .attr("height", height_path * good_l)
                    .attr("opacity", 1)

                g_temp_path.append('rect')
                    .attr("x", 210)
                    .attr("y", y_scale(i) - 10 + height_path * good_l)
                    .attr("fill", _this.worse_color)
                    .attr("stroke", 'none')
                    .attr("stroke-width", 0)
                    .attr("width", 10)
                    .attr("height", height_path * bad_l)
                    .attr("opacity", 1)

                //存储前面的部分
                var g_temp = svg.append('g')
                    .attr('width', 240)
                    .attr('height', 740)
                    .attr('class', 'pattern ' + i)
                    .on("click", function () {
                        if (_this.click_pattern != '') {
                            $(".clickhighlight." + _this.click_pattern.toString()).attr('visibility', 'hidden')
                        }
                        _this.click_pattern = key
                        $(".clickhighlight." + key).attr('visibility', 'visable')
                    })

                //加背景
                g_temp.append('rect')
                    .attr("x", 1)
                    .attr("y", y_scale(i) - 7)
                    .attr("fill", _this.normal_color)
                    .attr("width", 75)
                    .attr("height", 14)
                    .attr("opacity", 0.05)

                for (let k = 0; k < key.length; k++) {
                    g_temp.append("circle")
                        .attr("cx", x_scale(k))
                        .attr("cy", y_scale(i))
                        .attr("r", 6)
                        .attr("fill", color(parseInt(key[k])))
                        //.attr("stroke", '#5b5b5b')

                    g_temp.append("text")
                        .attr("x", x_scale(k) - 3)
                        .attr("y", y_scale(i) + 3)
                        .attr("font-size", 10)
                        .attr("stroke", 'white')
                        .attr("opacity", 1)
                        .text(parseInt(key[k]) + 1)

                    //console.log(key[k], parseInt(key[k]), color(parseInt(key[k])))
                    if (k < key.length - 1) {
                        g_temp.append("line")
                            .attr("x1", x_scale(k) + 6)
                            .attr("x2", x_scale(k + 1) - 6)
                            .attr("y1", y_scale(i))
                            .attr("y2", y_scale(i))
                            .attr("stroke", '#5b5b5b')
                    }
                }
                //bg
                g_temp.append('rect')
                    .attr("x", 80)
                    .attr("y", y_scale(i) - 7)
                    .attr("fill", _this.normal_color)
                    .attr("width", 75)
                    .attr("height", 14)
                    .attr("opacity", 0.05)

                // better
                g_temp.append('rect')
                    .attr("x", 80)
                    .attr("y", y_scale(i) - 7)
                    .attr("fill", _this.better_color)
                    .attr("width", data[0][key][0] * 80)
                    .attr("height", 7)
                    .attr("opacity", 1)

                // worse
                g_temp.append('rect')
                    .attr("x", 80)
                    .attr("y", y_scale(i))
                    .attr("fill", _this.worse_color)
                    .attr("width", data[0][key][1] * 80)
                    .attr("height", 7)
                    .attr("opacity", 1)

                //difference
                g_temp.append('rect')
                    .attr("x", 163)
                    .attr("y", y_scale(i) - 8)
                    .attr("width", 29)
                    .attr("height", 13)
                    .attr("fill", "none")
                    .attr("stroke", function () {
                        let value = 100 * (data[0][key][0] - data[0][key][1])
                        if (value > 0) {
                            return _this.better_color
                        } else {
                            return _this.worse_color
                        }
                    })
                g_temp.append('text')
                    .attr("x", 165)
                    .attr("y", y_scale(i) + 3)
                    .attr("font-size", 13)
                    .attr("fill", function () {
                        let value = 100 * (data[0][key][0] - data[0][key][1])
                        //console.log(key, value)
                        if (value > 0) {
                            return _this.better_color
                        } else {
                            return _this.worse_color
                        }
                    })
                    .text(function () {
                        let value = (100 * (data[0][key][0] - data[0][key][1])).toFixed(1)
                        if (value > 0) {
                            return value
                        } else {
                            return -value
                        }
                    })
            }
        }
    }
}