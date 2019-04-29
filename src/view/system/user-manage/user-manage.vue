<template>
  <div class="system-container">
    <!--操作栏-->
    <Row class="search-bar" :gutter="10">
      <i-col :span="6" :xxl="5">
        <Input v-model="search.name" @on-search="searchByButton" search placeholder="请输入账户名"></Input>
      </i-col>
      <i-col :span="5" :xxl="4">
        <roleSelect v-model="search.roles" clearable></roleSelect>
      </i-col>
      <i-col :span="4" :xxl="3">
        <Select v-model="search.userType" placeholder="请选择账户类型" clearable>
          <Option :value="1">域账号</Option>
          <Option :value="2">系统账号</Option>
        </Select>
      </i-col>
      <i-col :span="5" :xxl="4">
        <Button @click="searchByButton" type="primary">查询</Button>
      </i-col>
      <i-col :span="4" :xxl="8" align="right">
        <Button @click="addNewUser" type="primary" icon="md-add">添加用户</Button>
      </i-col>
    </Row>

    <Table class="table" :columns="columns" :data="userList" border>
      <template slot-scope="{ row, index }" slot="type">
        <span v-if="row.userType === 1">域账号</span>
        <span v-if="row.userType === 2">系统账号</span>
      </template>
      <template slot-scope="{ row, index }" slot="roles">
        <template v-if="row.roleIds">
          <span class="role-item" v-for="r in row.roleIds">{{roleFilter(r)}}</span>
        </template>
      </template>
      <template slot-scope="{ row, index }" slot="status">
        <Tag v-if="row.status" type="border" color="success">正常</Tag>
        <Tag v-else type="border" color="default">已停用</Tag>
      </template>
      <template slot-scope="{ row, index }" slot="opt">
        <Button @click="editUser(row)" type="primary" size="small" class="table-opt">编辑</Button>
        <Button @click="deleteUser(row)" type="error" class="table-opt" size="small">删除</Button>
      </template>
    </Table>

    <Page :total="total" :current.sync="currentPage" :page-size="pageSize"
          size="small" show-total show-elevator show-sizer/>

    <!--添加用户弹窗-->
    <Modal v-model="userVisible">
      <template slot="header">
        <b v-if="!isEdit" style="font-size: 14px">添加用户</b>
        <b v-else style="font-size: 14px">编辑用户</b>
      </template>
      <Row>
        <Col :span="21">
          <Form ref="userForm" :model="formData" :rules="rules" :label-width="120">
            <FormItem label="账号类型：" prop="type">
              <RadioGroup v-model="formData.userType">
                <Radio :label="1" :disabled="isEdit && formData.userType !== 1">域账号</Radio>
                <Radio :label="2" :disabled="isEdit && formData.userType !== 2">系统账号</Radio>
              </RadioGroup>
            </FormItem>
            <FormItem label="账户名：" prop="name">
              <Input v-model="formData.name" placeholder="请输入账户名（登录名）"></Input>
            </FormItem>
            <FormItem label="密码：" prop="password" v-if="formData.userType === 2">
              <Input v-model="formData.password" placeholder="请设置密码"></Input>
            </FormItem>
            <FormItem label="用户昵称：" prop="userName">
              <Input v-model="formData.userName" placeholder="请输入用户昵称，如：张三"></Input>
            </FormItem>
            <FormItem label="权限等级：" prop="secretLevel ">
              <levelSelect v-model="formData.secretLevel" clearable></levelSelect>
            </FormItem>
            <FormItem label="设置角色：" prop="roleIds">
              <role-select v-model="formData.roleIds" clearable multiple></role-select>
            </FormItem>
            <FormItem label="账户状态：" prop="status">
              <i-switch v-model="formData.status" size="large">
                <span slot="open">启用</span>
                <span slot="close">停用</span>
              </i-switch>
            </FormItem>
          </Form>
        </Col>
      </Row>
      <template slot="footer">
        <Button type="text" @click="userVisible = false">取消</Button>
        <Button type="primary" @click="submitUser">提交</Button>
      </template>
    </Modal>

  </div>
</template>

<script>
import levelSelect from '../component/level-select'
import roleSelect from '../component/role-select'
import util from '../libs/util'
export default {
  name: 'account-manage',
  components: { levelSelect, roleSelect },
  data () {
    return {
      currentPage: 1,
      pageSize: 20,
      total: 45,
      search: {
      },
      isEdit: false,
      userList: [],
      columns: [
        { title: '账户名', key: 'name' },
        { title: '账户类型', slot: 'type', key: 'type' },
        { title: '用户昵称', key: 'userName' },
        { title: '权限等级', key: 'secretLevel' },
        { title: '所属角色', slot: 'roles' },
        { title: '状态', slot: 'status', key: 'status' },
        { title: '操作', slot: 'opt', fixed: 'right', width: 130, align: 'center' }
      ],

      userVisible: false,
      formData: {
        userType: 1, // 账号类型 1：域账号， 2：系统账号
        status: true
      },
      rules: {
        name: [{ required: true, message: '账户名不能为空', trigger: 'blur' }],
        password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
        userName: [{ required: true, message: '用户昵称不能为空', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.getUser()
  },
  methods: {
    roleFilter (id) {
      let res = ''
      let role = this.$store.state.appp.roles.filter(item => item.id === Number(id))
      if (role && role.length) {
        res = role[0].roleName
      }
      return res
    },
    searchByButton () {
      this.getUser({
        name: this.search.name || '',
        roleid: this.search.roles || '',
        usertype: this.search.userType || ''
      })
    },
    getUser (config) {
      // config = Object.assign({}, {
      //   name: this.search.name || '',
      //   roleid: this.search.roles || '',
      //   usertype: this.search.userType || ''
      // }, config)
      config = config || {}
      let url = `/users?page=${this.currentPage}&limit=${this.pageSize}`;
      for (let p in config) {
        url = url + '&' + p + '=' + config[p]
      }

      this.$http({
        method: 'get',
        url: url,
      }).then(res => {
        if (res.data.Code === 0) {
          this.userList = res.data.Data || []
        }
      })
    },
    addNewUser () {
      this.userVisible = true
      this.isEdit = false
      this.formData = {
        userType: 1,
        status: true
      }
    },
    submitUser () {
      this.$refs.userForm.validate(valid => {
        if (valid) {
          let params = JSON.parse(JSON.stringify(this.formData))
          params.status = params.status ? 1 : 0
          console.table(params)
          let method = this.isEdit ? 'post' : 'put'
          this.$http({
            method: method,
            url: '/user',
            data: util.toUpperCase(params)
          }).then(res => {
            if (res.data.Code === 0) {
              this.userVisible = false

              if (this.isEdit) this.$Message.success('编辑成功！')
              else this.$Message.success('添加成功！')

              this.getUser()
            } else {
              this.$Modal.error({
                title: '提示',
                content: `<p>添加失败！</p><p>${res.data.Message}</p>`
              })
            }
          })
        }
      })
    },
    editUser (user) {
      this.userVisible = true
      this.isEdit = true
      let data = JSON.parse(JSON.stringify(user))
      data.status = !!data.status
      console.log(data)
      this.formData = data
    },
    // 删除
    deleteUser (user) {
      this.$Modal.confirm({
        title: '提示',
        content: '<p>确定要删除用户：' + user.name + ' 吗？</p>',
        onOk: () => {
          this.$http({
            method: 'delete',
            url: '/user',
            data: {id: user.id}
          }).then(res => {
            if (res.data.Code === 0) {
              this.$Message.success('删除成功！')
              this.getUser()
            }
          })
        }
      })
    }
  }
}
</script>

<style scoped>
@import "../system.less";
  .role-item{
    display: inline-block;
  }
  .role-item + .role-item{
    margin-left: 8px;
  }
</style>
