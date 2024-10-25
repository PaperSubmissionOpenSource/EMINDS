<template>
  <svg width="0" height="0" style="position: absolute">
    <defs>
      <pattern
        v-for="strip in strips"
        :key="strip.id"
        :id="strip.id"
        width="5"
        height="5"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line :stroke="strip.stroke" stroke-width="4" y2="20" />
      </pattern>

      <pattern
        v-for="strip in strips_wide"
        :key="strip.id"
        :id="strip.id"
        width="18"
        height="18"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line :stroke="strip.stroke" stroke-width="4" y2="20" />
      </pattern>

      <marker
        v-for="marker in markers"
        :key="marker.id"
        :id="marker.id"
        :viewBox="[0, 0, 12, 12]"
        refX="6"
        refY="6"
        :fill="marker.fill"
        :markerWidth="marker.size"
        :markerHeight="marker.size"
        orient="auto-start-reverse"
      >
        <path d="M 0 0 L 12 6 L 0 12 L 6 6 L 6 6" class="anchorHead" />
      </marker>
    </defs>
  </svg>
</template>

<script setup>
import { vaConfig } from "../store/vaConfig";

const color = vaConfig().color;

const strips = [
  { id: "stripe_visual", stroke: color.visual_light },
  { id: "stripe_audio", stroke: color.audio_light },
  { id: "stripe_event", stroke: color.event_light },
];

const strips_wide = [
  { id: "stripe_visual_wide", stroke: color.visual_light },
  { id: "stripe_audio_wide", stroke: color.audio_light },
  { id: "stripe_event_wide", stroke: color.event_light },
];

const markers = [
  { id: "arrow", fill: color.visual_dark, size: 20 },
  { id: "visualAnchor", fill: color.visual_dark, size: 3 },
  { id: "audioAnchor", fill: color.audio_dark, size: 3 },
  { id: "eventAnchor", fill: color.event_dark, size: 3 },
];
</script>

<style scoped>
</style>
