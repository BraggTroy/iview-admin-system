<template>
  <iframe :src="src" class="iframe"></iframe>
</template>

<script>
  export default {
    name: "",
    data () {
      return {
        src: ''
      }
    },
    created () {
      let src = this.$route.path
      this.src = src.slice(1, src.length)
    },
    mounted () {
    },
    methods: {

    }
  }
</script>

<style scoped>
  .iframe{
    border: none;
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
