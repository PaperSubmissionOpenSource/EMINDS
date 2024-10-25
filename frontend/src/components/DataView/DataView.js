import dataService from '../../service/dataService.js'
import pipeService from '../../service/pipeService.js';
import * as d3 from 'd3'
import $ from 'jquery'
import { thresholdScott } from 'd3';

export default {
    name: 'DataView',
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
            time_window: '2 weeks'
        }
    },
    watch: {
        data_group1: function(){
            const _this = this
            pipeService.emitDataset([_this.data_group1, _this.data_group2])
        },
        data_group2: function(){
            const _this = this
            pipeService.emitDataset([_this.data_group1, _this.data_group2])
        }
    },
    mounted: function () {
        const _this = this
        _this.drawLegend()
    },
    methods: {
        drawLegend() {
            const _this = this
            const svg1 = d3.select("#group1_title")
                .append("svg")
                .attr("width", 800)
                .attr("height", 20)

            let g_legend = svg1.append('g')

            g_legend.append("text")
                .attr("x", 2)
                .attr("y", 15)
                .attr("font-size", 19)
                .text("group1:")
                .attr("fill", "white")
            
            const svg2 = d3.select("#group2_title")
                .append("svg")
                .attr("width", 800)
                .attr("height", 20)

            g_legend = svg2.append('g')

            g_legend.append("text")
                .attr("x", 0)
                .attr("y", 15)
                .attr("font-size", 19)
                .text("group2:")
                .attr("fill", "white")
            
            const svg3 = d3.select("#timewindow")
                .append("svg")
                .attr("width", 800)
                .attr("height", 20)
        
            g_legend = svg3.append('g')

            g_legend.append("text")
                .attr("x", 25)
                .attr("y", 15)
                .attr("font-size", 19)
                .text("time window:")
                .attr("fill", "white")
        }
    }
}