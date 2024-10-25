import Vue from 'vue'

var pipeService = new Vue({
    data: {
        TESTEVENT: 'test_event',
        event_progression_segment: 'event_progression_segment',
        stage_summarization: 'stage_summarization',
        pattern: 'pattern',
		path: 'path',
		clickpath: 'clickpath',
		patternnone: 'patternone',
		ap: 'ap',
		dataset: 'dataset',
		key: 'key'
    },
    methods: {
        emitTestEvent: function(msg) {
            this.$emit(this.TESTEVENT, msg)
        },
        onTestEvent: function(callback) {
            this.$on(this.TESTEVENT, function(msg) {
                callback(msg)
            })
        },
        emitSegment: function(msg) {
			this.$emit(this.event_progression_segment, msg)
		},
		onSegment: function(callback) {
			this.$on(this.event_progression_segment, function(msg) {
				callback(msg)
			})
		},
        emitStage: function(msg) {
			this.$emit(this.stage_summarization, msg)
		},
		onStage: function(callback) {
			this.$on(this.stage_summarization, function(msg) {
				callback(msg)
			})
		},
        emitPattern: function(msg) {
			this.$emit(this.pattern, msg)
		},
		onPattern: function(callback) {
			this.$on(this.pattern, function(msg) {
				callback(msg)
			})
		},
		emitPath: function(msg) {
			this.$emit(this.path, msg)
		},
		onPath: function(callback) {
			this.$on(this.path, function(msg) {
				callback(msg)
			})
		},
		emitClickPath: function(msg) {
			this.$emit(this.clickpath, msg)
		},
		onClickPath: function(callback) {
			this.$on(this.clickpath, function(msg) {
				callback(msg)
			})
		},
		emitPatternNone: function(msg) {
			this.$emit(this.patternnone, msg)
		},
		onPatternNone: function(callback) {
			this.$on(this.patternnone, function(msg) {
				callback(msg)
			})
		},
		emitAP: function(msg) {
			this.$emit(this.ap, msg)
		},
		onAP: function(callback) {
			this.$on(this.ap, function(msg) {
				callback(msg)
			})
		},
		emitDataset: function(msg) {
			this.$emit(this.dataset, msg)
		},
		onDataset: function(callback) {
			this.$on(this.dataset, function(msg) {
				callback(msg)
			})
		},
		emitKey: function(msg) {
			this.$emit(this.key, msg)
		},
		onKey: function(callback) {
			this.$on(this.key, function(msg) {
				callback(msg)
			})
		},
    }
})
export default pipeService