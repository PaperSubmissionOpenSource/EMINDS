import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as d3 from 'd3'
import $, { data } from 'jquery'
import * as Sankey from '../../assets/sankey.js'
import { sliderBottom, sliderLeft } from 'd3-simple-slider'
import { formatPrefix, path, schemeGnBu, symbolDiamond2 } from 'd3'

export default {
    name: 'EventprogressionView',
    components: {
    },
    props: {
    },
    computed: {
    },
    data() {
        return {
            color_back: "#e9ecef", //sankey曲线的颜色
            color_back_individual: "#C3C3C9", //高亮曲线的颜色
            opacity_back: 0.6,
            line_color: '#003049',
            sankey_linecolor: '#d3d3d3',
            background_color: 'white',
            hover_color: '#C3C3C9',
            pattern_data: new Array(),
            segment_data: new Array(),
            start_flag: 0,
            better_color: '#ADC2BC',
            worse_color: '#f5cac3',
            angle_color: '#e5e9f2', //四个角的颜色
            color_list: ["#768f89", "#adb49f", "#EFE8BD", "#e9d1b4", "#ddbcab", "#d2aaa3"],
            // color_list: ["#B6B6C6", "#ADB9C1", "#AFB5A4", "#EFE8BD", "#e9d1b4", "#d2aaa3"],
            // color_list: ["#f4f1de", "#eab69f", "#e07a5f", "#3d405b", "#81b29a", "#f2cc8f"],
            // color_list: ["#264653", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51", "#E3C6A9"],
            // color_list: ["#B5B5C5", "#E2C9B3", "#ECC0C0", "#CAD5C3", "#9CB8CD", "#E3C6A9"],
            all_nodes: [],
            divide_line: '#d0b8ac',
            overall: 0, // 0表示默认选择查看全局better, 1表示全局worse，-1表示目前在展示align的sankey
            y_position: {},
            y_position_binary: {},
            transition_map: [],
            extracted_sequence: [], //存储包含该clickpath的序列
            width_bar: 15,
            y_scale_h: 0,
            clickpath: ''
        }
    },
    watch: {
        start_flag: function () {
            const _this = this
            if (_this.start_flag == 2) {
                _this.draweventprogressionSankey(_this.segment_data[0], _this.segment_data[2][0], _this.pattern_data)
                _this.start_flag = 0
            }
            d3.select('.prompt_3').raise();
        },
        overall: function () {
            const _this = this
            $('.progressionoverview').remove()
            $('.overall-better').attr("fill", _this.background_color)
            $('.overall-worse').attr("fill", _this.background_color)
            if (_this.overall == 0 || _this.overall == 1) {
                pipeService.emitPatternNone("none")
            }
            if (_this.overall == 0) {
                $('.clickpathtransition').remove()
                $('.overall-better').attr("fill", _this.better_color)
                _this.draweventprogressionSankey(_this.segment_data[0], _this.segment_data[2][0], _this.pattern_data)
            }
            if (_this.overall == 1) {
                $('.clickpathtransition').remove()
                $('.overall-worse').attr("fill", _this.worse_color)
                _this.draweventprogressionSankey(_this.segment_data[0], _this.segment_data[2][1], _this.pattern_data)
            }
            d3.select('.prompt_3').raise();
        }
    },
    mounted: function () {
        const _this = this
        _this.drawLegendSelect()

        const svg = d3.select(".eventprogressionviewbody")
            .append("svg")
            .attr("width", 880)
            .attr("height", 450)
            .attr("class", "eventprogression")

        const svg_bound = svg.append('g')
            .attr("width", 880)
            .attr("height", 450)
            .attr("transform", "translate(0, -30)")

        let g_prompt = svg.append('g')
            .attr("class", "prompt_3")
            .attr("visibility", "hidden")
            .attr("transform", "translate(200, 40)")

        let rect = g_prompt.append('rect')
            .attr('width', 650)  
            .attr('height', 105)  
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
            .text('Sankey diagrams provide an overview of the stage progression of the recovery or deterioration group. ')
            .attr('x', 10) 
            .attr('y', 20) 
        
        text.append('tspan')
            .text('A pattern-centric Sankey diagram shows the evolution of a specific stage pattern over time.')
            .attr('x', 10) 
            .attr('y', 45) 

        text.append('tspan')
            .text(' - All the sequences are aligned based on this selected pattern.')
            .attr('x', 10) 
            .attr('y', 60) 

        text.append('tspan')
            .text(' - The stage patterns at each time unit are aggregated into two nodes: the positivity (top) and negativity (bottom) nodes.')
            .attr('x', 10) 
            .attr('y', 75) 
        
        text.append('tspan')
            .text(' - The height of each node at different time units indicates the frequency of this pattern.')
            .attr('x', 10) 
            .attr('y', 90) 

        pipeService.onPattern(function (pattern_data) {
            //console.log('******onPattern******', pattern_data)
            _this.pattern_data[0] = _this.dicMap(pattern_data[0])
            _this.pattern_data[1] = _this.listMap(pattern_data[1])
            _this.start_flag = _this.start_flag + 1
            g_prompt.raise()
        })

        pipeService.onSegment(function (data) {
            console.log('******onSegment******', data)
            // ********map*******
            for (let t = 0; t < 2; t++) {
                for (let i = 0; i < data[1][t].length; i++) {
                    for (let j = 0; j < data[1][t][i].length; j++) {
                        data[1][t][i][j][3] = _this.stageMap(data[1][t][i][j][3])
                    }
                }
            }
            for (let t = 0; t < 2; t++) {
                for (let i = 0; i < data[2][t].length; i++) {
                    for (let j = 0; j < data[2][t][i].length; j++) {
                        for (let p = 0; p < data[2][t][i][j].length; p++) {
                            data[2][t][i][j][p][0] = _this.stageMap(data[2][t][i][j][p][0])
                        }
                    }
                }
            }
            _this.segment_data = data
            _this.start_flag = _this.start_flag + 1
            g_prompt.raise()
        })

        pipeService.onClickPath(function (data) {
            _this.overall = -1
            if (data[1] != -1) {
                _this.transition_map = data[1]
                $(".clickpathtransition").remove()
                _this.clickpath = data[0]
                _this.drawKeyPath(_this.segment_data[0], _this.segment_data[2], _this.pattern_data, data[0], data[1])
            }
            g_prompt.raise()
        })

        g_prompt.raise()

        // pipeService.onStage(function (msg) {
        //     var data = msg[2]
        //     var active_k_msg = msg[0]
        //     var passive_k_msg = msg[1]
        //     data = eval("(" + data + ")")
        //     _this.drawStage(active_k_msg, passive_k_msg, data)
        // })

    },
    methods: {
        number2literalMap(stage) {
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
        drawStageCopy(key) {
            const _this = this
            const key_list = key.split("").map(Number); // 将字符串拆分为字符数组，然后将每个字符转换为数字
            console.log(key_list)
            d3.select('.stagecopysvg').remove()
            const targetSVG = d3.select('.eventprogression')
                .append('g')
                .attr("width", 250)
                .attr("height", 200)
                .attr("class", "stagecopysvg")
                .style('z-index', 3)
                .attr('transform', 'translate(620, 280)')

            targetSVG.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 260)
                .attr('height', 147)
                .attr('fill', 'white')
                .attr('stroke', _this.sankey_linecolor)

            for (let i = 0; i < key.length; i++) {
                let sourceG1 = d3.select('.stage_single' + key_list[i])
                let sourceG2 = d3.select('.stage_interaction' + key_list[i])
                // 将目标SVG元素的大小设置为与源<g>元素相同
                targetSVG.attr("width", sourceG1.attr("width"))
                    .attr("height", sourceG1.attr("height"))

                // 在目标SVG元素中创建一个新的<g>元素
                let targetG1 = targetSVG.append("g");
                let targetG2 = targetSVG.append("g");

                targetG1.html(sourceG1.html())
                    .attr("transform", function () {
                        if (key.length == 3) {
                            return "scale(0.6) translate(" + (20 + i * 130) + ", 0)"
                        } else if (key.length == 2) {
                            return "scale(0.6) translate(" + (60 + i * 170) + ", 0)"
                        } else {
                            return "scale(0.6) translate(140, 0)"
                        }
                    })

                targetG2.html(sourceG2.html())
                    .attr("transform", function () {
                        if (key.length == 3) {
                            return "scale(0.6) translate(" + (20 + i * 130) + ", 0)"
                        } else if (key.length == 2) {
                            return "scale(0.6) translate(" + (60 + i * 170) + ", 0)"
                        } else {
                            return "scale(0.6) translate(140, 0)"
                        }
                    })
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
        drawLegendSelect() {
            const _this = this
            const svg = d3.select(".progressionviewheader")
                .append("svg")
                .attr("width", 750)
                .attr("height", 20)

            let g_legend = svg.append('g')

            g_legend.append("rect")
                .attr("x", 20)
                .attr("y", 3)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", _this.better_color)
                .attr("stroke", "black")
                .on("click", function () {
                    _this.overall = 0
                })
                .attr("class", "overall-better")

            g_legend.append("text")
                .attr("x", 35)
                .attr("y", 13)
                .attr("font-size", 13)
                .text("group1")

            g_legend.append("rect")
                .attr("x", 82)
                .attr("y", 3)
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", _this.background_color)
                .attr("stroke", "black")
                .on("click", function () {
                    _this.overall = 1
                })
                .attr("class", "overall-worse")

            g_legend.append("text")
                .attr("x", 97)
                .attr("y", 13)
                .attr("font-size", 13)
                .text("group2")

            g_legend.append("circle")
                .attr("cx", 741)
                .attr("cy", 7)
                .attr("r", 5)
                .attr("fill", "white")
                .attr("stroke", "red")
                .on("mouseover", function () {
                    $(".prompt_3").attr("visibility", "visible");
                })
                .on("mouseout", function () {
                    $(".prompt_3").attr("visibility", "hidden");
                });

            g_legend.append("text")
                .attr("x", 738)
                .attr("y", 10)
                .attr("font-size", 8)
                .text("?")
                .attr("fill", "#bc4b51")
                .on("mouseover", function () {
                    $(".prompt_3").attr("visibility", "visible");
                })
                .on("mouseout", function () {
                    $(".prompt_3").attr("visibility", "hidden");
                });
        },
        drawLegend(stage_number) {
            const _this = this
            const svg = d3.select(".progressionviewheader")
                .append("svg")
                .attr("width", 600)
                .attr("height", 20)

            const domain_x = []
            for (let i = 0; i < stage_number; i++) {
                domain_x.push(i)
            }

            const color = d3.scaleOrdinal()
                .domain(domain_x)
                .range(_this.color_list)

            let g_legend = svg.append('g')
            for (let c = 0; c < stage_number; c++) {
                svg.append("circle")
                    .attr("cx", 22 + c * 80)
                    .attr("cy", 10)
                    .attr("r", 7)
                    .attr("fill", color(c))
                    .attr("stroke", "#5b5b5b")

                svg.append("text")
                    .attr("x", 35 + c * 80)
                    .attr("y", 14)
                    .attr("font-size", 13)
                    .text("stage " + (c + 1))
            }
        },
        splitString(S, P) {
            let result = [];

            while (S.length > 0) {
                let segment = '';
                for (let i = 0; i < P.length; i++) {
                    if (S.startsWith(P[i])) {
                        if (P[i].length > segment.length) {
                            segment = P[i];
                        }
                    }
                }

                if (segment === '') {
                    // 如果找不到匹配的pattern，说明无法分解字符串
                    return null;
                }

                result.push(segment);
                S = S.slice(segment.length);
            }

            return result;
        },
        judgeSubString(parentString, subString) {
            let flag = 0
            for (let i = 0; i < parentString.length; i++) {
                if (parentString[i] == subString[0]) {
                    let flag_temp = 1
                    for (let j = 0; j < subString.length; j++) {
                        if (parentString[i + j] != subString[j]) {
                            flag_temp = 0
                            break
                        }
                    }
                    flag = flag_temp
                    if (flag == 1) {
                        return true
                    }
                }
            }
            return false
        },
        findSubstringPositions(str, substr) {
            const positions = [];
            let pos = str.indexOf(substr);
            while (pos !== -1) {
                positions.push(pos);
                pos = str.indexOf(substr, pos + 1);
            }
            return positions;
        },
        drawKeyPath(stage_number, segment_data, pattern_data, clickpath, path_data) {
            const _this = this
            const svg = d3.select(".eventprogression").append("g")
                .attr("class", "svg")
                .attr("width", 800)
                .attr("height", 450)
                .attr("class", "clickpathtransition")
                .attr("transform", "translate(0, 0)")

            // 首先在序列数据中extarct出所有包含clickpath的路径
            const data_sequence = []
            const data_string = []
            for (let i = 0; i < segment_data[0].length; i++) {
                let temp_individual = []
                let temp_string = ''
                for (let j = 0; j < segment_data[0][i].length; j++) {
                    temp_individual.push(parseInt(segment_data[0][i][j][0]))
                    temp_string = temp_string + segment_data[0][i][j][0]
                }
                data_sequence.push(temp_individual)
                data_string.push(temp_string)
            }
            for (let i = 0; i < segment_data[1].length; i++) {
                let temp_individual = []
                let temp_string = ''
                for (let j = 0; j < segment_data[1][i].length; j++) {
                    temp_individual.push(parseInt(segment_data[1][i][j][0]))
                    temp_string = temp_string + segment_data[1][i][j][0]
                }
                data_sequence.push(temp_individual)
                data_string.push(temp_string)
            }
            // extract出所有包括该子序列的序列
            const data_extracted = []
            for (let i = 0; i < data_string.length; i++) {
                if (_this.judgeSubString(data_string[i], clickpath)) {
                    data_extracted.push(data_string[i])
                }
            }
            const path_latter = []
            const path_former = []
            const extracted_sequence = []
            for (let i = 0; i < data_extracted.length; i++) {
                // 首先要找到clickpath出现的位置
                let positions = _this.findSubstringPositions(data_extracted[i], clickpath)
                for (let j = 0; j < positions.length; j++) {
                    if (positions[j] == 0 || positions[j] + clickpath.length == data_extracted[i].length) {
                        continue
                    } else {
                        // 然后把clickpath前后路径分解掉
                        let f_temp = data_extracted[i].substring(0, positions[j])
                        let l_temp = data_extracted[i].substring(positions[j] + clickpath.length, data_extracted[i].length)
                        let f_temp_segment = _this.splitString(f_temp, pattern_data[1])
                        let l_temp_segment = _this.splitString(l_temp, pattern_data[1])
                        path_former.push(f_temp_segment)
                        path_latter.push(l_temp_segment)
                        extracted_sequence.push([_this.splitString(f_temp, pattern_data[1]), _this.splitString(l_temp, pattern_data[1])])
                    }
                }
            }

            const tree_former = _this.createTreeFromSequences(path_former)
            const tree_latter = _this.createTreeFromSequences(path_latter)
            const domain_x = []
            for (let i = 0; i < stage_number; i++) {
                domain_x.push(i)
            }

            const color = d3.scaleOrdinal()
                .domain(domain_x)
                .range(_this.color_list)

            const lineGenerator = d3.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .curve(d3.curveCatmullRom.alpha(0.5))

            // 画中间
            const width = 840
            const height = 250 * 1.3
            const width_bar = 15
            let frequency_center = path_former.length
            const y_scale_h = height / frequency_center
            _this.y_scale_h = y_scale_h
            let svg_center = svg.append('g').attr('class', 'center')
            svg_center.append("rect")
                .attr("x", width / 2 - 5)
                .attr("y", 20)
                .attr("width", width_bar * 2 + 10)
                .attr("height", height + 10)
                .attr("fill", "none")
                .attr("stroke", _this.color_back)
                .attr("opacity", _this.opacity_back)

            let y_start_bar = 25

            for (let i = 0; i < clickpath.length; i++) {
                let x_start_temp = width / 2 + i * width_bar * 2 / clickpath.length
                if (clickpath.length == 1) {
                    x_start_temp = width / 2 + i * width_bar + 7
                }
                svg_center.append('rect')
                    .attr('x', x_start_temp)
                    .attr('y', y_start_bar)
                    .attr('width', function () {
                        if (clickpath.length < 2) {
                            return width_bar
                        } else {
                            return 2 / clickpath.length * width_bar
                        }
                    })
                    .attr('height', y_scale_h * frequency_center)
                    .attr('fill', color(parseInt(clickpath[i])))
                    .attr('stroke', 'white')
                    .attr('class', 'center-key')
                    .on('mouseenter', function () {
                        $('.center-key').attr('stroke', _this.hover_color).attr('stroke-width', 3)
                        $('.center-hover').attr('visibility', 'visable')
                        //console.log('Test1-drawStageCopy', clickpath)
                        _this.drawStageCopy(clickpath)
                    })
                    .on('mouseleave', function () {
                        $('.center-key').attr('stroke', 'white').attr('stroke-width', 0.5)
                        $('.center-hover').attr('visibility', 'hidden')
                        d3.select('.stagecopysvg').remove()
                    })
            }

            // 画中心hover图标
            let svg_center_hover = svg_center.append('g').attr("class", "center-hover").attr('visibility', 'hidden')
            svg_center_hover.append('rect')
                .attr('x', width / 2 - width_bar * 3)
                .attr('y', height / 2)
                .attr('width', 120)
                .attr('height', 30)
                .attr('fill', 'white')
                .attr('stroke', '#d3d3d3')
                .attr('stroke-width', 0.5)

            let degree = _this.pattern_data[0][clickpath]

            svg_center_hover.append("rect")
                .attr("x", width / 2)
                .attr("y", height / 2 + 5)
                .attr("width", 32)
                .attr("height", 20)
                .attr("stroke", function () {
                    if (degree[0] > degree[1]) {
                        return _this.better_color
                    } else {
                        return _this.worse_color
                    }
                })
                .attr("fill", "none")

            svg_center_hover.append("text")
                .attr("x", width / 2 + 1)
                .attr("y", height / 2 + 20)
                .attr("font-size", 15)
                .text(function () {
                    return Math.abs((degree[0] - degree[1]) * 100).toFixed(1)
                })
                .attr("fill", function () {
                    if (degree[0] > degree[1]) {
                        return _this.better_color
                    } else {
                        return _this.worse_color
                    }
                })

            let path_transition_former = _this.transition_map[clickpath][0]
            let path_transition_latter = _this.transition_map[clickpath][1]

            svg_center_hover.append("rect")
                .attr("x", width / 2 - 38)
                .attr("y", height / 2 + 5)
                .attr("width", 32)
                .attr("height", 20 * path_transition_former[0])
                .attr("stroke", 'none')
                .attr("fill", _this.better_color)

            svg_center_hover.append("rect")
                .attr("x", width / 2 - 38)
                .attr("y", height / 2 + 5 + 20 * path_transition_former[0])
                .attr("width", 32)
                .attr("height", 20 * path_transition_former[1])
                .attr("stroke", 'none')
                .attr("fill", _this.worse_color)

            svg_center_hover.append("rect")
                .attr("x", width / 2 + 38)
                .attr("y", height / 2 + 5)
                .attr("width", 32)
                .attr("height", 20 * path_transition_latter[0])
                .attr("stroke", 'none')
                .attr("fill", _this.better_color)

            svg_center_hover.append("rect")
                .attr("x", width / 2 + 38)
                .attr("y", height / 2 + 5 + 20 * path_transition_latter[0])
                .attr("width", 32)
                .attr("height", 20 * path_transition_latter[1])
                .attr("stroke", 'none')
                .attr("fill", _this.worse_color)

            // 画第i层路径，画出来并且返回每一个新状态的开始节点和结束节点
            for (let i = 1; i < 5; i++) {
                for (let j = 0; j < 2; j++) {
                    let type = ''
                    _this.all_nodes = []
                    let x_start_temp = 0
                    if (j == 1) {
                        type = 'latter'
                        _this.obtainSubPath(tree_latter, i)
                        x_start_temp = width / 2 + i * width_bar * 6.8
                    } else {
                        type = 'former'
                        _this.obtainSubPath(tree_former, i)
                        x_start_temp = width / 2 - i * width_bar * 6.8
                    }
                    // j=0表示画latter，j=1表示画former
                    let svg_temp = svg.append('g').attr('class', type + i)
                    let path = _this.sortArray(_this.all_nodes, pattern_data)
                    let t_sum = 0
                    for (let tt = 0; tt < _this.all_nodes.length; tt++) {
                        t_sum += _this.all_nodes[tt][1]
                    }
                    let y_start_temp = 25
                    let path_temp = path_former
                    if (type == 'latter') {
                        path_temp = path_latter
                    }
                    _this.drawPath(path, svg_temp, x_start_temp, y_start_temp, stage_number, y_scale_h, color, width, width_bar, type + i, path_temp, extracted_sequence)
                }
            }
            // 画每两层之间的link
            for (let i = 0; i < path_former.length; i++) {
                path_former[i].unshift(clickpath)
            }
            for (let i = 0; i < path_latter.length; i++) {
                path_latter[i].unshift(clickpath)
            }

            _this.y_position_binary['latter' + 0 + '-better'] = [width / 2 - 5, y_start_bar]
            _this.y_position_binary['former' + 0 + '-better'] = [width / 2 - 5, y_start_bar]
            _this.y_position_binary['latter' + 0 + '-worse'] = [width / 2 - 5, y_start_bar]
            _this.y_position_binary['former' + 0 + '-worse'] = [width / 2 - 5, y_start_bar]

            for (let i = 0; i < 4; i++) {
                let former_flow = _this.calculateFlow(path_former, i, pattern_data)
                let latter_flow = _this.calculateFlow(path_latter, i, pattern_data)
                // 先画latter
                _this.drawLink('latter', latter_flow, svg, width_bar, i, y_scale_h, "g", 0)
                _this.drawLink('former', former_flow, svg, width_bar, i, y_scale_h, "g", 0)
            }

        },
        drawLink(type, flow, svg, width_bar, num, y_scale_h, flag, y_d) {
            const _this = this
            let source_x = 0
            let source_x2 = 0
            let t = 5
            if (type == 'latter') {
                source_x = _this.y_position_binary[type + num + '-better'][0] + 2 * width_bar + 10
                source_x2 = _this.y_position_binary[type + (num + 1) + '-better'][0]
            } else {
                source_x = _this.y_position_binary[type + num + '-better'][0]
                source_x2 = _this.y_position_binary[type + (num + 1) + '-better'][0] + 2 * width_bar + 10
                t = -5
            }
            let source_y_better = _this.y_position_binary[type + num + '-better'][1]
            let source_y_worse = _this.y_position_binary[type + num + '-worse'][1]
            let source_y_better2 = _this.y_position_binary[type + (num + 1) + '-better'][1]
            let source_y_worse2 = _this.y_position_binary[type + (num + 1) + '-worse'][1]
            if (y_d < 0) {
                source_y_better = -y_d
                source_y_worse = -y_d
            }
            if (y_d > 0) {
                source_y_better2 = y_d
                source_y_worse2 = y_d
            }
            const lineGenerator = d3.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .curve(d3.curveCatmullRom.alpha(0.5))
            for (let i = 0; i < 4; i++) {
                flow[i] *= y_scale_h
                let data_temp = []
                if (i == 0) {
                    data_temp = [
                        { x: source_x, y: source_y_better },
                        { x: source_x + t, y: source_y_better },
                        { x: source_x2 - t, y: source_y_better2 },
                        { x: source_x2, y: source_y_better2 },
                    ]
                    source_y_better += flow[i]
                    source_y_better2 += flow[i]
                } else if (i == 1) {
                    data_temp = [
                        { x: source_x, y: source_y_better },
                        { x: source_x + t, y: source_y_better },
                        { x: source_x2 - t, y: source_y_worse2 },
                        { x: source_x2, y: source_y_worse2 },
                    ]
                    source_y_better += flow[i]
                    source_y_worse2 += flow[i]
                } else if (i == 2) {
                    data_temp = [
                        { x: source_x, y: source_y_worse },
                        { x: source_x + t, y: source_y_worse },
                        { x: source_x2 - t, y: source_y_better2 },
                        { x: source_x2, y: source_y_better2 },
                    ]
                    source_y_better2 += flow[i]
                    source_y_worse += flow[i]
                } else {
                    data_temp = [
                        { x: source_x, y: source_y_worse },
                        { x: source_x + t, y: source_y_worse },
                        { x: source_x2 - t, y: source_y_worse2 },
                        { x: source_x2, y: source_y_worse2 },
                    ]
                    source_y_worse2 += flow[i]
                    source_y_worse += flow[i]
                }

                for (let k = 0; k < flow[i]; k++) {
                    for (let p = 0; p < 4; p++) {
                        data_temp[p].y += 1
                    }
                    svg.append("path")
                        .datum(data_temp)
                        .attr("fill", "none")
                        .attr("stroke", function () {
                            if (flag == 'g') {
                                return _this.color_back
                            } else {
                                return _this.color_back_individual
                            }
                        })
                        .attr("stroke-width", 1)
                        .attr("opacity", _this.opacity_back)
                        .attr("d", lineGenerator)
                        .lower()
                }
            }
        },
        calculateFlow(path_sequence, n, pattern_data) {
            // 通过sequence获得第n层到第n+1层的流量
            let result = [0, 0, 0, 0] //好变好，好变坏，坏变好，坏变坏
            for (let i = 0; i < path_sequence.length; i++) {
                if (n > path_sequence[i].length - 2) {
                    continue
                }
                let key1 = path_sequence[i][n]
                let key2 = path_sequence[i][n + 1]
                if (pattern_data[0][key1][0] > pattern_data[0][key1][1]) {
                    //前面的路径是好
                    if (pattern_data[0][key2][0] > pattern_data[0][key2][1]) {
                        //后面的路径是好
                        result[0] += 1
                    } else {
                        //后面的路径是坏
                        result[1] += 1
                    }
                } else {
                    if (pattern_data[0][key2][0] > pattern_data[0][key2][1]) {
                        //后面的路径是好
                        result[2] += 1
                    } else {
                        //后面的路径是坏
                        result[3] += 1
                    }
                }
            }
            return result
        },
        drawPath(path, svg, x_start, y_start, stage_number, y_scale, color, width, width_bar, class_name, path_sequence, extracted_sequence) {
            const _this = this
            _this.y_position_binary[class_name + '-better'] = [x_start - 5, y_start]
            let y_end = _this.drawSubPath(path[0], svg, x_start, y_start, stage_number, y_scale, color, width, width_bar, class_name, path_sequence, extracted_sequence)
            //画好路径的背景
            let svg_temp = svg.append('g').lower()
            const color_stroke = _this.color_back

            svg_temp.append("rect")
                .attr("x", x_start - 5)
                .attr("y", y_start - 5)
                .attr("width", width_bar * 2 + 10)
                .attr("height", y_end - y_start + 10)
                .attr("fill", "none")
                .attr("opacity", _this.opacity_back)
                .attr("stroke", color_stroke)
            //画分割线
            y_end += 10
            y_start = y_end
            _this.y_position_binary[class_name + '-worse'] = [x_start - 10, y_start + 5]
            svg_temp.append("line")
                .attr("x1", x_start + 2 * width_bar + 10)
                .attr("x2", x_start - 10)
                .attr("y1", y_end)
                .attr("y2", y_end)
                .attr("stroke-width", 2)
                .attr("stroke", _this.divide_line)
            y_end = _this.drawSubPath(path[1], svg, x_start, y_end + 10, stage_number, y_scale, color, width, width_bar, class_name, path_sequence, extracted_sequence)
            // 画坏路径的背景
            svg_temp.append("rect")
                .attr("x", x_start - 5)
                .attr("y", y_start + 10)
                .attr("width", width_bar * 2 + 10)
                .attr("height", y_end - y_start - 5)
                .attr("fill", "none")
                .attr("opacity", _this.opacity_back)
                .attr("stroke", color_stroke)
        },
        obtainAllPath(num, key, path_sequence) {
            let result = []
            for (let i = 0; i < path_sequence.length; i++) {
                if (path_sequence[i].length > num && path_sequence[i][num] == key) {
                    for (let j = num + 1; j < path_sequence[i].length; j++) {
                        result.push(path_sequence[i][j])
                    }
                }
            }
            return result
        },
        calculateRatio(sequence, key_degree_map) {
            let result = [0, 0]
            for (let i = 0; i < sequence.length; i++) {
                let difference = key_degree_map[sequence[i]][0] - key_degree_map[sequence[i]][1]
                if (difference > 0) {
                    result[0] += difference
                } else {
                    result[1] += Math.abs(difference)
                }
            }
            if (result[0] + result[1] == 0) {
                return result
            } else {
                return [result[0] / (result[0] + result[1]), result[1] / (result[0] + result[1])]
            }
        },
        drawSubPath(data, svg, x_start, y_start, stage_number, y_scale, color, width, width_bar, class_name, path_sequence, extracted_sequence) {
            // data是由[路径，频率]组成的序列
            const _this = this
            let keys = Object.keys(data)
            let svg_temp = svg.append('g').lower()
            // 画hover之后会显示出来的negative/positive degree以及negative/positive change
            let key_degree_map = _this.pattern_data[0]//存储了这个path的好坏频率'13':[0.4, 0.7]
            let key_p = new Set()
            for (let i = 0; i < stage_number; i++) {
                for (let j = -1; j < stage_number; j++) {
                    for (let ij = -1; ij < stage_number; ij++) {
                        if (j == -1) {
                            key_p.add(i.toString())
                        } else {
                            if (ij == -1) {
                                key_p.add(i.toString() + j.toString())
                            } else {
                                key_p.add(i.toString() + j.toString() + ij.toString())
                            }
                        }
                    }
                }
            }
            for (let key of key_p) {
                if (keys.includes(key)) {
                    // 需要得到这一层开始以key为start的后续
                    let sequences_temp = _this.obtainAllPath(parseInt(class_name[class_name.length - 1]) - 1, key, path_sequence)
                    // 通过sequence得到路径的情况
                    let path_transition_temp = _this.calculateRatio(sequences_temp, key_degree_map)
                    let degree = key_degree_map[key]
                    // 然后需要通过path_transition_temp和degree画图
                    _this.y_position[class_name + '-' + key] = y_start
                    let data_final_t = []
                    for (let p = 0; p < extracted_sequence.length; p++) {
                        if (class_name[0] == 'f') {
                            if (extracted_sequence[p][0][parseInt(class_name[class_name.length - 1]) - 1] == key) {
                                // 把序列再拼起来
                                data_final_t.push(extracted_sequence[p])
                            }
                        }
                        if (class_name[0] == 'l') {
                            if (extracted_sequence[p][1][parseInt(class_name[class_name.length - 1]) - 1] == key) {
                                data_final_t.push(extracted_sequence[p])
                            }
                        }
                    }
                    //console.log("**********data_final_t",class_name, key, data_final_t.length, _this.calculateTemp2(data), extracted_sequence)
                    let data_final = []
                    for (let t = 0; t < data_final_t.length; t++) {
                        let temp_p = []
                        for (let q = 3; q >= 0; q--) {
                            if (data_final_t[t][0].length > q) {
                                if (_this.pattern_data[0][data_final_t[t][0][q]][0] > _this.pattern_data[0][data_final_t[t][0][q]][1]) {
                                    temp_p.push(1)
                                } else {
                                    temp_p.push(-1)
                                }
                            } else {
                                temp_p.push(0)
                            }
                        }
                        if (_this.pattern_data[0][_this.clickpath][0] > _this.pattern_data[0][_this.clickpath][1]) {
                            temp_p.push(1)
                        } else {
                            temp_p.push(-1)
                        }
                        for (let q = 0; q < 4; q++) {
                            if (data_final_t[t][1].length > q) {
                                if (_this.pattern_data[0][data_final_t[t][1][q]][0] > _this.pattern_data[0][data_final_t[t][1][q]][1]) {
                                    temp_p.push(1)
                                } else {
                                    temp_p.push(-1)
                                }
                            } else {
                                temp_p.push(0)
                            }
                        }
                        data_final.push(temp_p)
                    }
                    for (let t = 0; t < key.length; t++) {
                        svg_temp.append('rect')
                            .attr('x', function () {
                                if (key.length < 2) {
                                    return x_start + t * 2 / key.length * width_bar
                                } else {
                                    return x_start + t * 2 / key.length * width_bar
                                }
                            })
                            .attr('y', y_start)
                            .attr('width', function () {
                                if (key.length < 2) {
                                    return width_bar
                                } else {
                                    return 2 / key.length * width_bar
                                }
                            })
                            .attr('height', y_scale * data[key])
                            .attr('fill', color(parseInt(key[t])))
                            .attr('stroke', 'white')
                            .attr('stroke-width', 0.05)
                            .attr('class', class_name + key)
                            .attr('id', y_start)
                            .style('z-index', 2)
                            .on('click', function () {
                                pipeService.emitClickPath([key, -1])
                            })
                            .on('mouseenter', function () {
                                $('.' + class_name + key).attr('stroke', _this.hover_color)
                                    .attr('stroke-width', 1)
                                $('.' + class_name + '.hover.' + key).attr('visibility', 'visable')
                                //console.log('Test2-drawStageCopy', key)
                                _this.drawStageCopy(key)
                                // 画hover之后会显示的sankey
                                // 先提取在这个位置上有key元素的sequence
                                // 统计每个时间点之间的流向，result[0,0,0,0]好到好，好到坏，坏到好，坏到坏
                                for (let p = 4; p < data_final[0].length - 1; p++) {
                                    let temp_result = [0, 0, 0, 0]
                                    for (let q = 0; q < data_final.length; q++) {
                                        if (data_final[q][p] == 1) {
                                            if (data_final[q][p + 1] == 1) {
                                                temp_result[0] += 1
                                            }
                                            if (data_final[q][p + 1] == -1) {
                                                temp_result[1] += 1
                                            }
                                        }
                                        if (data_final[q][p] == -1) {
                                            if (data_final[q][p + 1] == 1) {
                                                temp_result[2] += 1
                                            }
                                            if (data_final[q][p + 1] == -1) {
                                                temp_result[3] += 1
                                            }
                                        }
                                    }
                                    let y_start_i = 0
                                    if (p - 3 == parseInt(class_name[6]) && class_name[0] == 'l') {
                                        y_start_i = parseFloat($('.' + class_name + key).attr('id')) - 3
                                    }
                                    if (p - 4 == parseInt(class_name[6]) && class_name[0] == 'l') {
                                        y_start_i = -parseFloat($('.' + class_name + key).attr('id')) - 3
                                    }
                                    _this.drawLink('latter', temp_result, svg_temp2, _this.width_bar, p - 4, _this.y_scale_h, "i", y_start_i)
                                }
                                for (let p = 4; p >= 1; p--) {
                                    let temp_result = [0, 0, 0, 0]
                                    for (let q = 0; q < data_final.length; q++) {
                                        if (data_final[q][p] == 1) {
                                            if (data_final[q][p - 1] == 1) {
                                                temp_result[0] += 1
                                            }
                                            if (data_final[q][p - 1] == -1) {
                                                temp_result[1] += 1
                                            }
                                        }
                                        if (data_final[q][p] == -1) {
                                            if (data_final[q][p - 1] == 1) {
                                                temp_result[2] += 1
                                            }
                                            if (data_final[q][p - 1] == -1) {
                                                temp_result[3] += 1
                                            }
                                        }
                                    }
                                    let y_start_i = 0
                                    if (5 - p == parseInt(class_name[6]) && class_name[0] == 'f') {
                                        y_start_i = parseFloat($('.' + class_name + key).attr('id')) - 3
                                    }
                                    if (4 - p == parseInt(class_name[6]) && class_name[0] == 'f') {
                                        y_start_i = -parseFloat($('.' + class_name + key).attr('id')) - 3
                                    }
                                    _this.drawLink('former', temp_result, svg_temp2, _this.width_bar, 4 - p, _this.y_scale_h, "i", y_start_i)
                                }
                            })
                            .on('mouseleave', function () {
                                $('.' + class_name + key).attr('stroke', 'white')
                                    .attr('stroke-width', 0.5)
                                $('.' + class_name + '.hover.' + key).attr('visibility', 'hidden')
                                d3.select('.stagecopysvg').remove()
                            })
                    }
                    if (key.length < 2) {
                        // 画空白部分的，比如当只出现一个的时候右边需要补足
                        svg_temp.append('rect')
                            .attr('x', x_start + width_bar)
                            .attr('y', y_start)
                            .attr('width', width_bar)
                            .attr('height', y_scale * data[key])
                            .attr('fill', 'white')
                            .attr('stroke', '#d3d3d3')
                            .attr('stroke-width', 0.5)
                            .attr('class', class_name + key)
                            .style('z-index', 2)
                            .on('click', function () {
                                pipeService.emitClickPath([key, -1])
                            })
                            .on('mouseenter', function () {
                                $('.' + class_name + key).attr('stroke', _this.hover_color)
                                    .attr('stroke-width', 1)
                                $('.' + class_name + '.hover.' + key).attr('visibility', 'visable')
                                //console.log('Test3-drawStageCopy', key)
                                _this.drawStageCopy(key)
                            })
                            .on('mouseleave', function () {
                                $('.' + class_name + key).attr('stroke', 'white')
                                    .attr('stroke-width', 0.5)
                                $('.' + class_name + '.hover.' + key).attr('visibility', 'hidden')
                                d3.select('.stagecopysvg').remove()
                            })
                    }
                    let svg_temp2 = svg.append('g').attr('class', class_name + ' hover ' + key).attr('visibility', 'hidden').attr("transform", "translate(0, 5)")
                    // 画hover之后会显示的path transition和positive/negative degree
                    svg_temp2.append('rect')
                        .attr('x', x_start)
                        .attr('y', y_start + y_scale * data[key] / 2)
                        .attr('width', 80)
                        .attr('height', 30)
                        .attr('fill', 'white')
                        .attr('stroke', '#d3d3d3')
                        .attr('stroke-width', 0.5)

                    svg_temp2.append("rect")
                        .attr("x", function () {
                            if (class_name[0] == 'f') {
                                return x_start + 42
                            } else {
                                return x_start + 5
                            }
                        })
                        .attr("y", y_start + y_scale * data[key] / 2 + 5)
                        .attr("width", 32)
                        .attr("height", 20)
                        .attr("stroke", function () {
                            if (degree[0] > degree[1]) {
                                return _this.better_color
                            } else {
                                return _this.worse_color
                            }
                        })
                        .attr("fill", "none")

                    svg_temp2.append("text")
                        .attr("x", function () {
                            if (class_name[0] == 'f') {
                                return x_start + 43
                            } else {
                                return x_start + 6
                            }
                        })
                        .attr("y", y_start + y_scale * data[key] / 2 + 20)
                        .attr("font-size", 15)
                        .text(function () {
                            return Math.abs((degree[0] - degree[1]) * 100).toFixed(1)
                        })
                        .attr("fill", function () {
                            if (degree[0] > degree[1]) {
                                return _this.better_color
                            } else {
                                return _this.worse_color
                            }
                        })

                    svg_temp2.append("rect")
                        .attr("x", function () {
                            if (class_name[0] == 'l') {
                                return x_start + 42
                            } else {
                                return x_start + 5
                            }
                        })
                        .attr("y", y_start + y_scale * data[key] / 2 + 5)
                        .attr("width", 32)
                        .attr("height", 20 * path_transition_temp[0])
                        .attr("stroke", 'none')
                        .attr("fill", _this.better_color)

                    svg_temp2.append("rect")
                        .attr("x", function () {
                            if (class_name[0] == 'l') {
                                return x_start + 42
                            } else {
                                return x_start + 5
                            }
                        })
                        .attr("y", y_start + y_scale * data[key] / 2 + 5 + 20 * path_transition_temp[0])
                        .attr("width", 32)
                        .attr("height", 20 * path_transition_temp[1])
                        .attr("stroke", 'none')
                        .attr("fill", _this.worse_color)

                    y_start += y_scale * data[key] + 0.3
                }
            }

            return y_start
        },
        obtainSubPath(node, depth, currentDepth = 0) {
            const _this = this
            if (typeof node === "object") {
                if (currentDepth === depth) {
                    _this.all_nodes.push([node.value, node.count])
                } else {
                    const childNodes = Object.values(node);
                    childNodes.forEach((childNode) => {
                        if (typeof childNode === "object") {
                            _this.obtainSubPath(childNode, depth, currentDepth + 1);
                        }
                    });
                }
            }
        },
        calculateTemp(arr) {
            let sum = 0
            for (let i = 0; i < arr.length; i++) {
                sum += arr[i][1]
            }
            return sum
        },
        calculateTemp2(tree) {
            let sum = 0
            let keys = Object.keys(tree)
            for (let i = 0; i < keys.length; i++) {
                sum += tree[keys[i]]
            }
            return sum
        },
        sortArray(seq, pattern_data) {
            const _this = this
            let tree = {};
            for (let i = 0; i < seq.length; i++) {
                let item = seq[i];
                if (Object.keys(tree).includes(item[0])) {
                    tree[item[0]] += item[1];
                } else {
                    tree[item[0]] = item[1];
                }
            }
            return _this.sortTree(tree, pattern_data)
        },
        sortTree(tree, pattern_data) {
            // 好结点:[按照stage类别排序],坏节点:[按照stage类别排序]
            const _this = this
            let tree_keys = Object.keys(tree)
            let better_list = {}
            let worse_list = {}
            for (let i = 0; i < tree_keys.length; i++) {
                let key = tree_keys[i]
                let number = tree[tree_keys[i]]
                if (pattern_data[0][key][0] > pattern_data[0][key][1]) {
                    better_list[key] = number
                } else {
                    worse_list[key] = number
                }
            }
            return [better_list, worse_list]
        },
        draw_glyph(svg, pathpattern, pathtransition, color, flag) {
            const _this = this
            svg.append("rect")
                .attr("x", 365)
                .attr("y", 400)
                .attr("width", 70)
                .attr("height", 20)
                .attr("fill", '#5b5b5b')
                .attr("stroke", '#5b5b5b')
                .attr("opacity", 0.1)

            svg.append("rect")
                .attr("x", 352)
                .attr("y", 395)
                .attr("width", 96)
                .attr("height", 30)
                .attr("fill", 'none')
                .attr("stroke", '#5b5b5b')
                .attr("opacity", 0.2)
            for (let i = 0; i < pathpattern.length; i++) {
                if (i < pathpattern.length - 1) {
                    svg.append("line")
                        .attr("x1", 384 + i * 30)
                        .attr("x2", 384 + (i + 1) * 30)
                        .attr("y1", 410)
                        .attr("y2", 410)
                        .attr("stroke", "black")
                }
                svg.append("circle")
                    .attr("cx", 384 + i * 30)
                    .attr("cy", 410)
                    .attr("r", 7)
                    .attr("fill", color(parseInt(pathpattern[i])))
                    .attr("stroke", '#5b5b5b')
            }
            const height_path = 30
            let good = pathtransition[0]
            let bad = pathtransition[1]
            // 画中心的前面和后面的路径转移
            if (flag == "l") {
                svg.append('rect')
                    .attr("x", 435)
                    .attr("y", 395)
                    .attr("fill", _this.better_color)
                    .attr("width", 13)
                    .attr("height", height_path * good)
                    .attr("opacity", 0.8)

                svg.append('rect')
                    .attr("x", 435)
                    .attr("y", 395 + height_path * good)
                    .attr("fill", _this.worse_color)
                    .attr("width", 13)
                    .attr("height", height_path * bad)
                    .attr("opacity", 0.8)
            } else {
                svg.append('rect')
                    .attr("x", 352)
                    .attr("y", 395)
                    .attr("fill", _this.better_color)
                    .attr("width", 13)
                    .attr("height", height_path * good)
                    .attr("opacity", 0.8)

                svg.append('rect')
                    .attr("x", 352)
                    .attr("y", 395 + height_path * good)
                    .attr("fill", _this.worse_color)
                    .attr("width", 13)
                    .attr("height", height_path * bad)
                    .attr("opacity", 0.8)
            }
        },
        calculate_node(tree, pattern_data) {
            const _this = this
            var result_n1 = []
            var result_n2 = []
            // 计算出这个节点的子节点频率最高的四个
            let tree_keys = Object.keys(tree)
            let data = {}
            for (let i = 0; i < tree_keys.length; i++) {
                data[tree_keys[i]] = tree[tree_keys[i]]['count']
            }
            let result = _this.maxnObtain(data, 4)
            //console.log("the four nodes next", result)
            for (let i = 0; i < result.length; i++) {
                _this.all_nodes = []
                _this.traverseTree(tree[result[i][0]])
                if (_this.all_nodes.length == 0) {
                    result_n1.push(result[i][0])
                    result_n2.push('end')
                    continue
                }
                let transition = [0, 0] //好，坏
                for (let i = 0; i < _this.all_nodes.length; i++) {
                    transition[0] += pattern_data[0][_this.all_nodes[i][0]][0] * _this.all_nodes[i][1]
                    transition[1] += pattern_data[0][_this.all_nodes[i][0]][1] * _this.all_nodes[i][1]
                }
                let s1 = transition[0] + transition[1]
                transition[0] /= s1
                transition[1] /= s1
                result_n1.push(result[i])
                result_n2.push(transition)
            }
            return [result_n1, result_n2]
        },
        createTreeFromSequences(sequences) {
            const root = {};
            sequences.forEach((sequence) => {
                let currentNode = root
                sequence.forEach((value) => {
                    if (!currentNode[value]) {
                        currentNode[value] = {
                            value,
                            count: 0,
                        };
                    }
                    currentNode[value].count++
                    currentNode = currentNode[value]
                })
            })
            return root
        },
        traverseTree(node) {
            const _this = this
            if (typeof node === "object") {
                _this.all_nodes.push([node.value, node.count])
                const childNodes = Object.values(node);
                childNodes.forEach((childNode) => {
                    if (typeof childNode === "object") {
                        _this.traverseTree(childNode);
                    }
                });
            }
        },
        drawIndividualSequence(stage_number, data, x_start, y_start, pattern_data) {
            const svg = d3.select(".eventprogression").append("g")
                .attr("class", "svg")
                .attr("width", 800)
                .attr("height", 750)
                .attr("transform", "translate(0, " + (y_start + 10) + ")")
            const width = 800
            const height = 350
            const _this = this
            const user_number = data.length

            const domain_x = []
            for (let i = 0; i < stage_number; i++) {
                domain_x.push(i)
            }
            const color = d3.scaleOrdinal()
                .domain(domain_x)
                .range(_this.color_list)

            const x_scale = d3.scaleLinear()
                .range([x_start + 10, x_start + 100])
                .domain([0, 5])

            const y_scale = d3.scaleLinear()
                .range([y_start + 40, y_start + 40 + height])
                .domain([0, 20])

            for (let i = 0; i < 35; i++) {
                var latter_together = 0
                for (let j = 0; j < data[i].length; j++) {
                    if (latter_together == 0) {
                        // 判断后面还有多少个数据
                        let latter_num = data[i].length - j - 1
                        var value = 0
                        //最多不考虑超过3个数据
                        if (latter_num > 3) {
                            latter_num = 3
                        }
                        if (latter_num == 0) {
                            let value_arr = pattern_data[0][data[i][j][0][0].toString()]
                            value = value_arr[0] - value_arr[1]
                        } else {
                            for (let t = latter_num; t >= 0; t--) {
                                // 后面跟几个数据点
                                var key_temp = data[i][j][0][0].toString()
                                for (let p = 1; p <= t; p++) {
                                    key_temp = key_temp + data[i][j + p][0][0].toString()
                                }
                                if (pattern_data[1].includes(key_temp)) {
                                    latter_together = t
                                    let value_arr = pattern_data[0][key_temp]
                                    value = value_arr[0] - value_arr[1]
                                    break
                                }
                            }
                        }
                        svg.append("rect")
                            .attr("x", x_scale(j) - 7)
                            .attr("y", y_scale(i) - 8)
                            .attr("width", x_scale(j + latter_together) - x_scale(j) + 14)
                            .attr("height", 15)
                            .attr("fill", function () {
                                if (value > 0) {
                                    return _this.better_color
                                } else {
                                    return _this.worse_color
                                }
                            })
                            .attr("opacity", function () {
                                //console.log(pattern_data)
                                if (value < 0) {
                                    return 0.6 + (-value)
                                } else {
                                    return 0.6 + (value)
                                }
                            })
                        latter_together = latter_together + 1
                    }
                    svg.append("circle")
                        .attr("cx", x_scale(j))
                        .attr("cy", y_scale(i))
                        .attr("r", 6)
                        .attr("stroke", "#5b5b5b")
                        .attr("fill", color(data[i][j][0][0]))
                    latter_together = latter_together - 1
                }
            }
        },
        deepClone(initalObj, finalObj) {
            var obj = finalObj || {};
            for (var i in initalObj) {
                var prop = initalObj[i];        // 避免相互引用对象导致死循环，如initalObj.a = initalObj的情况
                if (prop === obj) {
                    continue;
                }
                if (typeof prop === 'object') {
                    obj[i] = (prop.constructor === Array) ? [] : {};
                    arguments.callee(prop, obj[i]);
                } else {
                    obj[i] = prop;
                }
            }
            return obj;
        },
        draweventprogressionSankey(stage_number, data, pattern_data) {
            const y_start = 0
            const domain_x = []
            const _this = this
            for (let i = 0; i < stage_number; i++) {
                domain_x.push(i)
            }
            const color = d3.scaleOrdinal()
                .domain(domain_x)
                .range(_this.color_list)
            const width = 850
            const height = 400
            const user_number = data.length
            const svg = d3.select(".eventprogression").append("g")
                .attr("class", "progressionoverview")
                .attr("width", 850)
                .attr("height", 450)
                .attr("transform", "translate(0, 10)")

            var stages = []
            for (let i = 0; i < stage_number; i++) {
                stages.push(i)
            }

            var data_sequence = []
            for (let i = 0; i < user_number; i++) {//对于每一个人
                let individual_sequence = []
                for (let j = 0; j < data[i].length - 1; j++) {//对于每一个时间
                    individual_sequence.push(data[i][j][0][0])
                }
                data_sequence.push(individual_sequence)
            }

            var key_sequence = []
            var value_sequence = []
            // 计算每个点属于什么pattern，相当于给每个点赋予pattern key
            for (let i = 0; i < data_sequence.length; i++) {
                let latter_together = 0
                let individual_key = []
                let individual_value = []
                for (let j = 0; j < data_sequence[i].length; j++) {
                    if (latter_together == 0) {
                        // 判断后面还有多少个数据
                        let latter_num = data_sequence[i].length - j - 1
                        var value = 0
                        var key_temp = ''
                        //最多不考虑超过1个数据
                        if (latter_num > 1) {
                            latter_num = 1
                        }
                        if (latter_num == 0) {
                            let value_arr = pattern_data[0][data_sequence[i][j].toString()]
                            value = value_arr[0] - value_arr[1]
                            key_temp = data_sequence[i][j].toString()
                        } else {
                            for (let t = latter_num; t >= 0; t--) {
                                // 后面跟几个数据点
                                key_temp = data_sequence[i][j].toString()
                                for (let p = 1; p <= t; p++) {
                                    key_temp = key_temp + data_sequence[i][j + p].toString()
                                }
                                if (pattern_data[1].includes(key_temp)) {
                                    latter_together = t
                                    let value_arr = pattern_data[0][key_temp]
                                    value = value_arr[0] - value_arr[1]
                                    break
                                }
                            }
                        }
                        for (let t = 0; t < latter_together + 1; t++) {
                            individual_key.push(key_temp)
                            individual_value.push(value)
                        }
                        latter_together = latter_together + 1
                    }
                    latter_together = latter_together - 1
                }
                key_sequence.push(individual_key)
                value_sequence.push(individual_value)
            }

            // 需要对每一个时间点维持一个矩阵「1-1，1-2，1-3，....」分别有多少人
            var time_matrix = {}
            for (let i = 0; i < data_sequence.length; i++) {
                for (let j = 0; j < data_sequence[i].length; j++) {
                    let current_stage = data_sequence[i][j]
                    let next_stage = 'x'
                    if (j < data_sequence[i].length - 1) {
                        next_stage = data_sequence[i][j + 1]
                    }
                    let key_transition = current_stage.toString() + next_stage.toString()
                    if (Object.keys(time_matrix).includes(j.toString())) {
                        if (Object.keys(time_matrix[j.toString()]).includes(key_transition)) {
                            time_matrix[j.toString()][key_transition] = time_matrix[j.toString()][key_transition] + 1
                        } else {
                            time_matrix[j.toString()][key_transition] = 1
                        }
                    } else {
                        time_matrix[j.toString()] = {}
                        time_matrix[j.toString()][key_transition] = 1
                    }
                }
            }
            const overall_scale = 500 / data.length * 0.6
            const x_scale = d3.scaleLinear()
                .domain([0, Object.keys(time_matrix).length - 1])
                .range([20, 830])
            const y_scale = 0.5 * overall_scale
            const svg_node_boundingbox = svg.append('g')
                .attr("width", 250)
                .attr("height", 300)
            // 记录每个节点开始的位置
            let y_position = {}
            let y_position2 = {}
            let y_position_end = new Array()
            // 先画出了最后一列的其他所有列
            for (let i = 0; i < Object.keys(time_matrix).length; i++) {
                var y_start_temp = 30
                for (let p = 0; p < stage_number; p++) {
                    let key_tt = i.toString() + p.toString()
                    //console.log(key_tt)
                    y_position_end[key_tt] = y_start_temp
                    //console.log(y_position_end)
                    for (let q = 0; q < stage_number; q++) {
                        let key_t = p.toString() + q.toString()
                        if (Object.keys(time_matrix[i]).includes(key_t)) {
                            if (Object.keys(y_position).includes(i.toString())) {
                                y_position[i.toString()][key_t] = y_start_temp
                                y_position2[i.toString()][key_t] = y_start_temp
                            } else {
                                y_position[i.toString()] = {}
                                y_position2[i.toString()] = {}
                                y_position[i.toString()][key_t] = y_start_temp
                                y_position2[i.toString()][key_t] = y_start_temp
                            }
                            y_start_temp = y_start_temp + y_scale * time_matrix[i][key_t]
                        }
                    }
                    let key_t = p.toString() + 'x' //考虑最末尾的位置
                    if (Object.keys(y_position).includes(i.toString())) {
                        y_position[i.toString()][key_t] = y_start_temp
                    } else {
                        y_position[i.toString()] = {}
                        y_position[i.toString()][key_t] = y_start_temp
                    }
                    if (Object.keys(time_matrix[i]).includes(key_t)) {
                        y_start_temp = y_start_temp + y_scale * time_matrix[i][key_t]
                    }
                    y_start_temp = y_start_temp + 10
                }
            }
            // 画link
            const h_scale = 0.5 * overall_scale
            const svg_link1 = svg.append('g')
                .attr("width", 250)
                .attr("height", 300)
                .style("z-index", 1)
                .attr("transform", "translate(0, 5)")

            const svg_link2 = svg.append('g')
                .attr("width", 250)
                .attr("height", 300)
                .style("z-index", 2)
                .attr("transform", "translate(0, 5)")

            const lineGenerator = d3.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .curve(d3.curveCatmullRom.alpha(0.5))
            let y_position_keys = Object.keys(y_position)
            for (let i = 0; i < y_position_keys.length - 1; i++) {//第几个时间
                let y_position_keys2 = Object.keys(y_position[i])//该时间的stage-stage
                for (let p = 0; p < stage_number; p++) {
                    for (let q = 0; q < stage_number; q++) {
                        let current_pair = p.toString() + q.toString()
                        if (y_position_keys2.includes(current_pair)) {
                            let current_y = y_position2[y_position_keys[i]][current_pair]
                            let next_stage = q.toString()
                            if (next_stage != 'x') {
                                let key_tt = y_position_keys[i] + next_stage
                                let key_tt_next = (parseInt(y_position_keys[i]) + 1).toString() + next_stage
                                let next_y = y_position_end[key_tt_next]
                                let height_temp = time_matrix[y_position_keys[i]][current_pair] * h_scale
                                let data_temp = [
                                    { x: x_scale(i) + 15, y: current_y + height_temp / 2 },
                                    { x: x_scale(i) + 25, y: current_y + height_temp / 2 },
                                    { x: x_scale(i + 1) - 5, y: next_y + height_temp / 2 },
                                    { x: x_scale(i + 1) + 10, y: next_y + height_temp / 2 }
                                ]
                                if (height_temp > 10) {
                                    svg_link2.append("path")
                                        .datum(data_temp)
                                        .attr("fill", "none")
                                        .attr("stroke", _this.sankey_linecolor)
                                        .attr("stroke-width", height_temp)
                                        .attr("opacity", 0.5)
                                        .attr("d", lineGenerator);
                                } else {
                                    svg_link1.append("path")
                                        .datum(data_temp)
                                        .attr("fill", "none")
                                        .attr("stroke", _this.sankey_linecolor)
                                        .attr("stroke-width", height_temp)
                                        .attr("opacity", 0.2)
                                        .attr("d", lineGenerator);
                                }

                                y_position_end[key_tt_next] = y_position_end[key_tt_next] + height_temp
                            }
                        }
                    }
                }
            }

            const svg_node = svg.append('g')
                .attr("width", 250)
                .attr("height", 300)
                .attr("transform", "translate(0, 5)")
            for (let i = 0; i < data_sequence.length; i++) {
                let y_last = 0
                for (let j = 0; j < data_sequence[i].length; j++) {
                    let key_t = ''
                    if (j == data_sequence[i].length - 1) {
                        key_t = data_sequence[i][j].toString() + 'x'
                    } else {
                        key_t = data_sequence[i][j].toString() + data_sequence[i][j + 1].toString()
                    }
                    svg_node.append('rect')
                        .attr('x', x_scale(j))
                        .attr('y', y_position[j][key_t])
                        .attr('height', y_scale)
                        .attr('width', 20)
                        .attr('fill', color(data_sequence[i][j]))
                        .attr('stroke', color(data_sequence[i][j]))
                        .attr('class', 'node' + key_sequence[i][j])

                    y_position[j][key_t] = y_position[j][key_t] + y_scale
                    //画link，跟上一个点连起来，但是这不是sankey的画法
                    // if (j != 0){
                    //     svg_node.append('line')
                    //         .attr("x1", x_scale(j))
                    //         .attr("x2", x_scale(j-1) + 20)
                    //         .attr("y1", y_position[j][key_t])
                    //         .attr("y2", y_last)
                    //         .attr("stroke", "black")
                    // }
                    y_last = y_position[j][key_t]
                }
            }

        },
        draweventprogression(stage_number, data, y_start) {
            //console.log("event progression view", data)
            const width = 800
            const height = 750
            const _this = this
            const user_number = data.length
            const svg = d3.select(".eventprogression").append("g")
                .attr("class", "svg")
                .attr("width", 800)
                .attr("height", 750)
                .attr("transform", "translate(0, " + (y_start + 10) + ")")

            var data_dic = new Array()
            for (let i = 0; i < 27; i++) {
                data_dic[i] = new Array()
                for (let j = 0; j < stage_number; j++) {
                    data_dic[i][j] = 0
                }
            }

            var subgroups = []
            for (let j = 0; j < stage_number; j++) {
                subgroups.push('stage' + j)
            }

            for (let i = 0; i < data.length; i++) { //第i个人
                for (let j = 0; j < data[i].length; j++) {
                    if (j == 27) {
                        continue
                    }
                    let stage = data[i][j][3]
                    data_dic[j][stage] += 1
                }
            }

            var data_vis = []
            for (let i = 0; i < 27; i++) {
                let temp = new Array()
                temp["group"] = i + 1
                for (let j = 0; j < stage_number; j++) {
                    temp["stage" + j] = data_dic[i][j]
                }
                data_vis.push(temp)
            }

            data = data_vis

            var groups = d3.map(data, function (d) { return (d.group) }).keys()

            // Add X axis
            var x = d3.scaleBand()
                .domain(groups)
                .range([20, width])
                .padding([0.2])
            svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickSizeOuter(0))

            // Add Y axis
            var y = d3.scaleLinear()
                .domain([0, user_number])
                .range([height, 20])
            svg.append("g")
                .call(d3.axisLeft(y))
                .attr("transform", "translate(27, 0)")

            // color palette = one color per subgroup
            var color = d3.scaleOrdinal()
                .domain(subgroups)
                .range(d3.schemeTableau10)

            // 把每个stage对应的颜色打印出来
            if (y_start == 0) {
                for (let c = 0; c < subgroups.length; c++) {
                    svg.append("rect")
                        .attr("x", 10 + c * 60)
                        .attr("y", 3)
                        .attr("fill", color(subgroups[c]))
                        .attr("width", 10)
                        .attr("height", 10)

                    svg.append("text")
                        .attr("x", 10 + c * 60 + 15)
                        .attr("y", 10)
                        .attr("font-size", 7)
                        .text(subgroups[c])
                }
            }

            //stack the data? --> stack per subgroup
            var stackedData = d3.stack()
                .keys(subgroups)(data)

            //console.log(stackedData)

            svg.append("g")
                .selectAll("g")
                // Enter in the stack data = loop key per key = group per group
                .data(stackedData)
                .join("g")
                .attr("fill", d => color(d.key))
                .attr("class", d => "myRect " + d.key) // Add a class to each subgroup: their name
                .selectAll("rect")
                // enter a second time = loop subgroup per subgroup to add all rectangles
                .data(d => d)
                .join("rect")
                .attr("x", d => x(d.data.group))
                .attr("y", d => y(d[1]))
                .attr("height", d => y(d[0]) - y(d[1]))
                .attr("width", x.bandwidth())
                .attr("stroke", "#5b5b5b")
                .on("mouseover", function (event, d) { // What happens when user hover a bar
                    // what subgroup are we hovering
                    const subGroupName = d3.select(this.parentNode).datum().key
                    // Reduce opacity of all rect to 0.2
                    d3.selectAll(".myRect").style("opacity", 0.2)
                    // Highlight all rects of this subgroup with opacity 1. It is possible to select them since they have a specific class = their name.
                    d3.selectAll("." + subGroupName).style("opacity", 1)
                })
                .on("mouseleave", function (event, d) { // When user do not hover anymore
                    d3.selectAll(".myRect")
                        .style("opacity", 1)
                })
        }
    }
}