<script setup lang="ts">
const props = defineProps<{
  segments: Array<{ label: string; value: number; color: string }>
  size?: number
  thickness?: number
}>()

const sz = computed(() => props.size ?? 180)
const th = computed(() => props.thickness ?? 32)
const r = computed(() => (sz.value - th.value) / 2)
const c = computed(() => sz.value / 2)

const total = computed(() =>
  props.segments.reduce((s, seg) => s + seg.value, 0)
)

const GAP = props.segments.length > 1 ? (2 * Math.PI) / 360 : 0

const arcs = computed(() => {
  if (!total.value) return []
  let angle = -Math.PI / 2
  return props.segments.map((seg) => {
    const fraction = seg.value / total.value
    const sweep = Math.max(0.001, fraction * 2 * Math.PI - GAP)
    const midAngle = angle + sweep / 2

    const x1 = c.value + r.value * Math.cos(angle)
    const y1 = c.value + r.value * Math.sin(angle)
    const x2 = c.value + r.value * Math.cos(angle + sweep)
    const y2 = c.value + r.value * Math.sin(angle + sweep)

    const large = sweep > Math.PI ? 1 : 0
    const path = `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r.value} ${r.value} 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`

    const tx = c.value + r.value * Math.cos(midAngle)
    const ty = c.value + r.value * Math.sin(midAngle)

    angle += fraction * 2 * Math.PI

    return {
      path,
      color: seg.color,
      percent: Math.round(fraction * 100),
      tx,
      ty,
      label: seg.label,
      value: seg.value,
    }
  })
})

const hoveredIndex = ref<number | null>(null)
const hoveredArc = computed(() =>
  hoveredIndex.value !== null ? arcs.value[hoveredIndex.value] : null
)
</script>

<template>
  <svg :width="sz" :height="sz" :viewBox="`0 0 ${sz} ${sz}`">
    <circle
      v-if="!arcs.length"
      :cx="c"
      :cy="c"
      :r="r"
      fill="none"
      class="stroke-muted"
      :stroke-width="th"
    />

    <circle
      v-if="arcs.length === 1"
      :cx="c"
      :cy="c"
      :r="r"
      fill="none"
      :stroke="arcs[0]?.color"
      :stroke-width="th"
      style="cursor: pointer"
      @mouseenter="hoveredIndex = 0"
      @mouseleave="hoveredIndex = null"
    />
    <path
      v-for="(arc, i) in arcs"
      v-else
      :key="i"
      :d="arc.path"
      fill="none"
      :stroke="arc.color"
      :stroke-width="th"
      stroke-linecap="butt"
      style="cursor: pointer"
      @mouseenter="hoveredIndex = i"
      @mouseleave="hoveredIndex = null"
    />

    <!-- percentage labels inside arc stroke -->
    <text
      v-for="(arc, i) in arcs"
      v-show="arc.percent >= 5"
      :key="`p-${i}`"
      :x="arc.tx"
      :y="arc.ty"
      text-anchor="middle"
      dominant-baseline="central"
      fill="white"
      font-size="10"
      font-weight="600"
      style="pointer-events: none; user-select: none"
    >
      {{ arc.percent }}%
    </text>

    <!-- center: label + value on hover -->
    <g v-if="hoveredArc" style="pointer-events: none; user-select: none">
      <g class="text-muted">
        <text
          :x="c"
          :y="c - 10"
          text-anchor="middle"
          dominant-baseline="central"
          fill="currentColor"
          font-size="9"
        >
          {{ hoveredArc.label }}
        </text>
      </g>
      <g class="text-foreground">
        <text
          :x="c"
          :y="c + 8"
          text-anchor="middle"
          dominant-baseline="central"
          fill="currentColor"
          font-size="11"
          font-weight="700"
        >
          {{ formatCurrency(hoveredArc.value, { includeZero: true }) }}
        </text>
      </g>
    </g>
  </svg>
</template>
