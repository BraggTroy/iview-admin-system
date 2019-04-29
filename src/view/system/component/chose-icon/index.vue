<script>
import choseModal from './chose-modal'
export default {
  name: 'choseIcon',
  components: { choseModal },
  data () {
    return {
    }
  },
  props: {
    onChose: Function
  },
  methods: {
    handleOpen () {
      this.$refs.iconModal.visible = true
    },
    handleChose (v) {
      this.onChose && this.onChose(v)
    }
  },
  render () {
    let { handleOpen } = this

    const data = {
      on: {
        click: handleOpen
      }
    }

    let modal = (
      <choseModal
        ref='iconModal'
        handleChose={this.handleChose}>
      </choseModal>
    )

    return (
      <div>
        <div {...data}>
          { this.$slots.default }
        </div>
        { modal }
      </div>
    )
  }
}
</script>

<style scoped>

</style>
