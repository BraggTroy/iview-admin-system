<template>
  <!--权限等级选择-->
  <Select :value="level" @on-change="change" :clearable="clearable" :placeholder="placeholder">
    <Option v-for="l in levels" :value="l.value" :key="'key' + l.value">
      {{l.label}}
    </Option>
  </Select>
</template>

<script>
export default {
  name: '',
  data () {
    return {
      levels: []
    }
  },
  model: {
    prop: 'level',
    event: 'up'
  },
  props: {
    level: Number,
    clearable: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择权限等级'
    },
    hideZero: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    this.getLevels()
  },
  methods: {
    getLevels () {
      let levelsData = this.$store.state.appp.levels
      if (!levelsData) {
        this.levels = [
          { label: '开放', value: 0 },
          { label: '一级', value: 1 },
          { label: '二级', value: 2 },
          { label: '三级', value: 3 },
          { label: '四级', value: 4 }
        ]
        this.$store.commit('updateLevels', this.levels)
      } else {
        this.levels = levelsData
      }
    },
    change (v) {
      this.$emit('up', v)
    }
  }
}
</script>

<style scoped>

</style>
