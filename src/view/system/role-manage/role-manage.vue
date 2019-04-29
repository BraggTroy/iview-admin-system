<template>
  <div class="system-container">
    <!--操作栏-->
    <Row class="search-bar">
      <i-col :span="5" :xxl="4">
        <Input placeholder="请输入角色名称" @on-search="getRoles" search clearable></Input>
      </i-col>
      <i-col :span="19" :xxl="20" align="right">
        <Button @click="addNewRole" type="primary" icon="md-add">添加角色</Button>
      </i-col>
    </Row>

    <Table class="table" :columns="columns" :data="roleList" border>
      <template slot-scope="{ row, index }" slot="Created">
        {{ new Date(row.Created).getTime() | time('yyyy-MM-dd HH:mm') }}
      </template>
      <template slot-scope="{ row, index }" slot="Updated">
        {{ new Date(row.Updated).getTime() | time('yyyy-MM-dd HH:mm') }}
      </template>
      <template slot-scope="{ row, index }" slot="status">
        <Tag v-if="row.status" type="border" color="success">已启用</Tag>
        <Tag v-else type="border" color="error">已关闭</Tag>
      </template>
      <template slot-scope="{ row, index }" slot="opt">
        <Button @click="editRole(row)" type="primary" size="small" class="table-opt">编辑</Button>
        <Button @click="deleteRole(row)" type="error" class="table-opt" size="small">删除</Button>
      </template>
    </Table>

    <Page :total="total" :current.sync="currentPage" :page-size="pageSize"
          size="small" show-total show-elevator show-sizer/>


    <!--编辑角色弹窗-->
    <Modal v-model="roleVisible">
      <template slot="header">
        <b style="font-size: 14px" v-if="!formData.id">添加角色</b>
        <b style="font-size: 14px" v-else>编辑</b>
      </template>
      <Row>
        <Col :span="21">
          <Form ref="roleForm" :model="formData" :rules="rules" :label-width="120">
            <FormItem label="名称：" prop="roleName">
              <Input v-model="formData.roleName " placeholder="角色名称"></Input>
            </FormItem>
            <FormItem label="是否启用：" prop="status">
              <i-switch v-model="formData.status" :true-value="1" :false-value="0" size="large">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
            <FormItem label="备注：" prop="remark">
              <Input v-model="formData.remark" type="textarea" :rows="3" :maxlength="150" placeholder="角色备注"></Input>
            </FormItem>
          </Form>
        </Col>
      </Row>
      <template slot="footer">
        <Button type="text" @click="roleVisible = false">取消</Button>
        <Button type="primary" @click="submitRole">提交</Button>
      </template>
    </Modal>

  </div>
</template>

<script>
import util from '../libs/util'

export default {
  name: '',
  data () {
    return {
      currentPage: 1,
      pageSize: 20,
      total: 45,
      roleList: [],
      columns: [
        { title: '序号', type: 'index', width: 60, align: 'center' },
        { title: '角色名称', key: 'roleName' },
        { title: '备注', key: 'remark' },
        { title: '创建时间', slot: 'Created', key: 'Created' },
        { title: '更新时间', slot: 'Updated', key: 'Updated' },
        { title: '状态', slot: 'status', key: 'status' },
        { title: '操作', slot: 'opt', width: 140, fixed: 'right', align: 'center' }
      ],
      roleVisible: false,
      formData: {
        status: 1
      },
      rules: {
        roleName : [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.getRoles()
  },
  methods: {
    getRoles (role) {
      this.roleList = this.$store.state.appp.roles
      if (!this.roleList) {
        let this_ = this
        util.queryRoles(this_, function (res) {
          this_.roleList = res.data.Data
        })
      }
    },
    // 点击添加角色
    addNewRole () {
      this.roleVisible = true
      this.formData = {
        status: 1
      }
    },
    submitRole () {
      let method = 'put' // 添加
      if (this.formData.id) {
        method = 'post' // 编辑
      }

      this.$refs.roleForm.validate(valid => {
        if (valid) {
          let params = {
            RoleName: this.formData.roleName,
            Status: this.formData.status,
            Remark: this.formData.remark || ''
          }
          if (method === 'post') {
            params.Id = this.formData.id
          }

          this.$http({
            method: method,
            url: '/role/',
            data: params
          }).then(res => {
            if (res.data.Code === 0) {
              this.roleVisible = false

              if (method === 'put') this.$Message.success('添加成功！')
              else this.$Message.success('编辑成功！')

              let this_ = this
              util.queryRoles(this_, function (res) {
                this_.roleList = res.data.Data
              })
            }
          })
        }
      })
    },
    editRole (role) {
      this.roleVisible = true
      this.formData = JSON.parse(JSON.stringify(role))
    },
    deleteRole (role) {
      this.$Modal.confirm({
        title: '提示',
        content: `确定要删除${role.roleName }吗？`,
        onOk: () => {
          this.$http({
            method: 'delete',
            url: '/role',
            data: {id : role.id}
          }).then(res => {
            if (res.data.Code === 0) {
              this.$Message.success('删除成功！')
              let this_ = this
              util.queryRoles(this_, function (res) {
                this_.roleList = res.data.Data
              })
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
</style>
