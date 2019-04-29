<template>
  <!--角色选择-->
  <Select :value="role" @on-change="change" :clearable="clearable" :multiple="multiple" :placeholder="placeholder">
    <Option v-for="l in roleList" :value="l.id" :key="'key' + l.id">
      {{l.roleName}}
    </Option>
  </Select>
</template>

<script>
import util from '../libs/util'
export default {
  name: '',
  data () {
    return {
      roleList: [
      ]
    }
  },
  model: {
    prop: 'role',
    event: 'up'
  },
  props: {
    role: {
    },
    clearable: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择角色'
    }
  },
  mounted () {
    this.getRolesData()
  },
  methods: {
    getRolesData () {
      let rolesData = this.$store.state.appp.roles
      if (!rolesData) {
        let this_ = this
        util.queryRoles(this_, function (res) {
          this_.roleList = res.data.Data
        })
      } else {
        this.roleList = rolesData
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
