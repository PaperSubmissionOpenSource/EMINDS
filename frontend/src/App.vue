<template>
  <div id="app" style="width: 100%">
    <el-container>
      <el-header id="systemHeader">
        <el-col :span="11">
          EMINDS
        </el-col>
        <el-col :span="11">
          <DataView />
        </el-col>
      </el-header>
      <el-main id="systemMain">
         <el-row>
            <el-col :span="5" style="padding:2px;">
                <BehaviormodeView />
            </el-col>
            <el-col :span="15" style="padding:2px;">
              <el-row :span="10">
                <StageView />
              </el-row>
              <el-row :span="14" style="padding:2px;">
                <EventprogressionView />
              </el-row>
            </el-col>
            <el-col :span="4" style="padding:2px;">
              <StatisticsView />
            </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
/* global d3 $ _ */
import BehaviormodeView from "./components/BehaviormodeView/BehaviormodeView.vue"
import StageView from "./components/StageView/StageView.vue"
import EventprogressionView from "./components/EventprogressionView/EventprogressionView.vue"
import StatisticsView from "./components/StatisticsView/StatisticsView.vue"
import DataView from "./components/DataView/DataView.vue"

export default {
  name: "app",
  components: {
    BehaviormodeView,
    EventprogressionView,
    StatisticsView,
    StageView,
    DataView
  },
  data() {
    return {

    };
  },
  watch: {
  },
  mounted: function () {
    console.log("d3: ", d3); /* eslint-disable-line */
    console.log("$: ", $); /* eslint-disable-line */
    console.log("this: ", this, this.components);
    console.log(
      "_",
      _.partition([1, 2, 3, 4], (n) => n % 2)
    ); /* eslint-disable-line */
  },
  methods: {

  }
};
</script>

<style>
#app {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #292929;
  width: 1440px;
  margin: auto;
}

#systemHeader {
  background-color: #363636;
  color: white;
  text-align: start;
  font-weight: bold;
  font-size: 25px;
  line-height: 60px;
  width: 1470px;
  margin: auto;
}

#systemMain {
  padding: 8px;
  color: #333;
  text-align: center;
  height: 770px;
  margin: auto;
  background: #EBEBEB;
}

.viewheader {
  font-weight: bold;
  text-align: start;
  padding: 5px;
  background: #e5e9f2;
}

.viewbody {
  height: 360px;
}

</style>
