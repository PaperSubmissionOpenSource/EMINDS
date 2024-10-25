<template src='./StatisticsView.html'></template>
<script src='./StatisticsView.js'></script>

<style scoped>
#statisticsview {
    border: 1px solid lightgray;
    border-radius: 2px;
    height: 750px;
    width: 240px;
    margin: left;
    background: white;
}

.patternviewheader {
  border-bottom: 1px solid lightgray;
  font-weight: bold;
  text-align: start;
  padding: 5px;
  background: 'white';
}

.select {
  width: 125px;
  height: 20px;
  font-size: 14px;
  border-radius: 2px;
  border: 1px solid #ccc;
  background: white;
}

.patternviewdisplay{
  width: 239px;
  height: 560px;
  overflow-x: hidden;
  overflow-y: scroll
}

.patternviewdisplay::-webkit-scrollbar {
  width: 3px;
  height: 2px;
}

.patternviewdisplay::-webkit-scrollbar-thumb {
  background-color: #adb5bd
}
</style>
