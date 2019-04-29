<template>
  <div class="system-container">
    <!--操作栏-->
    <Row class="search-bar">
      <Button @click="addNewNode" type="primary" icon="md-add">添加子节点</Button>
      <Button @click="addRootNode" icon="md-add">添加一级菜单</Button>
      <Button @click="deleteNode" icon="md-trash">删除</Button>
    </Row>
    <Row class="sys-main" :gutter="10" type="flex">
      <!--左侧菜单树-->
      <i-col span="7">
        <Alert show-icon>
          当前选择编辑： <span class="select-count">{{selected.title}}</span>
        </Alert>

        <div style="position: relative">
          <Input v-model="treeMenuName" @on-change="filterMenu" placeholder="输入菜单名搜索" clearable search></Input>
          <Tree :data="treeData" show-checkbox
                @on-check-change="checkChange"
                @on-select-change="selectChange"></Tree>
          <Spin size="large" fix v-if="loading"></Spin>
        </div>
      </i-col>

      <!--右侧编辑表单-->
      <i-col span="10">
        <Form ref="menuForm" :model="formData" :rules="rules" :label-width="120">
          <FormItem label="名称：" prop="title">
            <Input v-model="formData.title" placeholder="名称显示在菜单中"></Input>
          </FormItem>
          <FormItem label="路径：" prop="path">
            <Input @on-change="inputPath('formData')" v-model="formData.path" placeholder="例如：/sys/manage，支持外链如：https://www.baidu.com">
              <Tooltip slot="suffix" placement="right" max-width="200">
                <span slot="content" style="width: 180px; display: inline-block;">若输入外链请填写完整，必须添加http或https</span>
                <Icon type="md-alert" />
              </Tooltip>
            </Input>
          </FormItem>
          <FormItem label="路由名称：" prop="name">
            <Input v-model="formData.name" placeholder="请输入由字母组成的字符串，如：sys"></Input>
          </FormItem>
          <FormItem label="图标：" prop="icon">
            <!--图标选择组件-->
            <chose-icon
              :on-chose="handleChose">
              <Input v-model="formData.icon" readonly placeholder="请选择图标">
                <Icon slot="suffix" :type="formData.icon"></Icon>
              </Input>
            </chose-icon>

          </FormItem>
          <FormItem label="页面组件：" prop="component">
            <Input :readonly="defaultComponents.includes(formData.component.toUpperCase())"
                   v-model="formData.component" placeholder="请输入组件，如：test/test-page(去除后缀)">
              <Tooltip slot="suffix" max-width="200" placement="right">
                <span slot="content" style="width: 180px; display: inline-block;"
                >一级菜单组件为‘Main’，若二级存在子节点则二级为‘parentView’，若添加外链则为‘website’</span>
                <Icon type="md-alert" />
              </Tooltip>
            </Input>
          </FormItem>
          <FormItem label="安全等级：" prop="secretLevel">
            <levelSelect v-model="formData.secretLevel"></levelSelect>
          </FormItem>
          <FormItem label="排序：" prop="order">
            <InputNumber v-model="formData.order" :max="100" :min="1"></InputNumber>
            <span style="margin-left: 15px"><Icon type="md-alert" size="16" /> 数值越大，排序越靠后</span>
          </FormItem>
          <FormItem label="是否隐藏：" prop="showInMenu">
            <i-switch v-model="formData.hideInMenu" size="large">
              <span slot="open">是</span>
              <span slot="close">否</span>
            </i-switch>
          </FormItem>
          <FormItem label="是否启用：" prop="status">
            <i-switch :true-value="1" :false-value="0" v-model="formData.status" size="large">
              <span slot="open">是</span>
              <span slot="close">否</span>
            </i-switch>
          </FormItem>
          <FormItem label="设为登录后首页：" prop="status">
            <i-switch :true-value="1" :false-value="0" v-model="formData.isHomePage" size="large">
              <span slot="open">是</span>
              <span slot="close">否</span>
            </i-switch>
          </FormItem>
          <FormItem align="center">
            <Button type="primary" @click="handleSubmit" icon="ios-create-outline">修改并保存</Button>
          </FormItem>
        </Form>
      </i-col>
    </Row>

    <!--添加节点 弹窗， 根节点和常规节点通用-->
    <Modal v-model="newFormVisible" :mask-closable="false">
      <template slot="header">
        <b style="font-size: 14px" v-if="addMenuLevel === 0">添加一级菜单</b>
        <b style="font-size: 14px" v-else>
          为 {{formData.title}} 添加子节点
        </b>
      </template>
      <Row>
        <i-col :span="22">
          <Form ref="newForm" :model="newForm" :rules="rules" :label-width="120">
            <FormItem label="名称：" prop="title">
              <Input v-model="newForm.title" placeholder="名称显示在菜单中"></Input>
            </FormItem>
            <FormItem label="路径：" prop="path">
              <!--<Input v-model="newForm.path" placeholder="例如：/sys"></Input>-->
              <Input @on-change="inputPath('newForm')" v-model="newForm.path" placeholder="例如：/sys/manage，支持外链如：https://www.baidu.com">
                <Tooltip slot="suffix" placement="right" max-width="200">
                  <span slot="content" style="width: 180px; display: inline-block;">若输入外链请填写完整，必须添加http或https</span>
                  <Icon type="md-alert" />
                </Tooltip>
              </Input>
            </FormItem>
            <FormItem label="路由名称：" prop="name">
              <Input v-model="newForm.name" placeholder="请输入路由名称，不可重复，如：sys"></Input>
            </FormItem>
            <FormItem label="图标：" prop="icon">
              <!--图标选择组件-->
              <chose-icon
                :on-chose="handleNewChose">
                <Input v-model="newForm.icon" readonly placeholder="请选择图标">
                  <Icon slot="suffix" :type="newForm.icon"></Icon>
                </Input>
              </chose-icon>
            </FormItem>
            <FormItem label="页面组件：" prop="component">
              <Input :readonly="newForm.component === 'Main' && addMenuLevel === 0
               || newForm.component === 'parentView' && addMenuLevel === 1
               || newForm.component === 'website'" placeholder="请输入组件，如：test/test-page(去除后缀)"
                     v-model="newForm.component">
                <Tooltip slot="suffix" max-width="200" placement="right">
                  <span slot="content" style="width: 180px; display: inline-block;"
                  >若二级存在子节点则二级为‘parentView’，若添加外链则为‘website’</span>
                  <Icon type="md-alert" />
                </Tooltip>
              </Input>
            </FormItem>
            <FormItem label="安全等级：" prop="secretLevel">
              <levelSelect v-model="newForm.secretLevel"></levelSelect>
            </FormItem>
            <FormItem label="排序：" prop="order">
              <InputNumber v-model="newForm.order" :max="100" :min="1"></InputNumber>
              <span style="margin-left: 15px"><Icon type="md-alert" size="16" /> 数值越大，排序越靠后</span>
            </FormItem>
            <FormItem label="是否隐藏：" prop="showInMenu">
              <i-switch v-model="newForm.hideInMenu" size="large">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
            <FormItem label="是否启用：" prop="status">
              <i-switch :true-value="1" :false-value="0" v-model="newForm.status" size="large">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
          </Form>
        </i-col>
      </Row>
      <template slot="footer">
        <Button type="text" @click="newFormVisible = false" size="large">取消</Button>
        <Button type="primary" @click="submitNewForm" size="large">确定</Button>
      </template>
    </Modal>

  </div>
</template>

<script>
import levelSelect from '../component/level-select'
import choseIcon from '../component/chose-icon/index'
import util from '../libs/util'

export default {
  name: '',
  components: { levelSelect, choseIcon },
  data () {
    return {
      loading: false,
      defaultComponents: ['MAIN', 'PARENTVIEW', 'WEBSITE'],
      // treeData: [], // 树
      // treeData_copy: [], // 树备份
      // allTreeData: [], // 原始数据
      checkedList: [], // 树 - 勾选
      selectedList: [], // 树 - 当前选中
      formData: {
        status: 0,
        hideInMenu: false,
        component: '',
        icon: '',
        secretLevel: 0,
        isHomePage: 0
      },
      formDataSource: null,  // 编辑中的formData备份数据
      rules: {
        title: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        path: [{ required: true, message: '路径不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '路由名称不能为空', trigger: 'blur' }],
        component: [{ required: true, message: '页面组件不能为空', trigger: 'blur' }]
      },
      treeMenuName: '',
      choseIconVisible: false,
      newForm: {
        status: 1,
        hideInMenu: false,
        component: '',
        icon: '',
        secretLevel: 0
      },
      newFormVisible: false,
      addMenuLevel: 0,  // 当前添加的节点的层级
    }
  },
  computed: {
    selected () { // 当前选中的对象
      return this.selectedList[0] || {}
    },
    defaultMenu () {
      return this.$store.state.appp.menuListSource.map(m => {
        let res = JSON.parse(JSON.stringify(m))
        res.expand = true
        if (res.children) {
          res.children.forEach(r => {
            if (r.children) {
              r.expand = true
            }
          })
        }
        return res
      })
    },
    treeData () {
      return util.arrDeepCopy(this.defaultMenu)
    },
    treeData_copy () {
      return util.arrDeepCopy(this.defaultMenu)
    },
    allTreeData () {
      return util.arrDeepCopy(this.$store.state.appp.menuSource)
    }
  },
  mounted () {
    this.getAllMenus()
  },
  methods: {
    // 图标选择回调
    handleChose (v) {
      this.formData.icon = v
    },
    handleNewChose (v) {
      this.newForm.icon = v
    },
    getAllMenus () {

    },
    // 勾选
    checkChange (menu) {
      // console.log(menu)
      this.checkedList = menu
    },
    // 单选
    selectChange (menu) {
      this.selectedList = menu
      this.formDataSource = menu[0]
      if (menu.length) {
        this.formData = JSON.parse(JSON.stringify(menu[0]))
        if (this.formData.component === 'website') {
          this.formData.path = this.formData.path.substr(1, this.formData.length)
        }
      } else {
        this.formData = { status: 1, hideInMenu: false, component: '', icon: '', secretLevel: 0, isHomePage: 0 }
      }
    },
    filterMenu (v) {
      if (this.treeMenuName !== '') {
        this.treeData = this.allTreeData.filter(d => d.title.match(this.treeMenuName))
      } else {
        this.treeData = this.treeData_copy
        console.log(this.treeData_copy)
      }
    },
    // 提交修改并保存
    handleSubmit () {
      this.$refs['menuForm'].validate((valid) => {
        if (valid) {
          this.loading = true
          let params = JSON.parse(JSON.stringify(this.formData))
          params.hideInMenu = params.hideInMenu ? 1 : 0
          if (params.component === 'website') {
            params.path = '/' + params.path
          }
          this.$http({
            method: 'post',
            url: '/page',
            data: util.toUpperCase(params)
          }).then(res => {
            if (res.data.Code === 0) {
              console.log('修改成功')
              // 清除缓存
              this.$store.commit('clearState')
              util.initRouter(this)
              this.loading = false
            }
          })
        }
      })
    },
    // 添加新子节点
    addNewNode () {
      // let node = this.selected
      let node = this.formDataSource
      if (!node || !node.id) {
        this.$Message.warning('请先选择一个菜单节点')
      } else {
        if (node.menuLevel === 0) {  // 一级
          if (node.component.toUpperCase() !== 'MAIN') { // 如果非常规二级组建
            this.$Modal.warning({
              title: '警告',
              content: '该节点为常规页面，若需添加子页面，请将组件设为‘Main’'
            });
          } else {
            // 添加
            this.pushNewNode(node)
          }
        }
        if (node.menuLevel === 1) { // 二级
          if (node.component.toUpperCase() !== 'PARENTVIEW') { // 如果非常规二级组建
            this.$Modal.warning({
              title: '警告',
              content: '该节点为常规页面，若需添加子页面，请将组件设为‘parentView’'
            });
            if (this.formData.component.toUpperCase() === 'PARENTVIEW') {
              this.$Modal.warning({
                title: '警告',
                content: '请先保存！'
              });
            }
          } else {
            // 添加
            this.pushNewNode(node)
          }
        }
        if (node.menuLevel === 3) { // 三级
          this.$Message.error('最多支持三级，无法添加更深层级页面');
        }
      }
    },
    // 调出弹窗，执行添加
    // pnode表示父节点
    pushNewNode (pNode) {
      // 重置newForm
      this.newForm = {
        status: 1,
        hideInMenu: false,
        component: '',
        icon: '',
        secretLevel: 0,
        parentId: pNode.id,
        menuLevel: pNode.menuLevel + 1
      }
      this.newFormVisible = true
      this.addMenuLevel = pNode.menuLevel + 1
    },
    // 添加根节点，按钮点击
    addRootNode () {
      this.addMenuLevel = 0
      this.newFormVisible = true
      this.newForm = {
        status: 1,
        hideInMenu: false,
        icon: '',
        secretLevel: 0,
        component: 'Main',
        menuLevel: 0
      }
    },
    // 提交新加的节点，后台检测：title,path,name是否重复
    submitNewForm () {
      this.$refs.newForm.validate(valid => {
        if (valid) {
          // 提交数据
          this.loading = true
          let params = JSON.parse(JSON.stringify(this.newForm))
          params.hideInMenu = params.hideInMenu ? 1 : 0
          if (params.component === 'website') {
            params.path = '/' + params.path
          }
          this.$http({
            method: 'put',
            url: '/page',
            data: util.toUpperCase(params)
          }).then(res => {
            if (res.data.Code === 0) {
              this.newFormVisible = false
              // 清除树原始数据缓存并获取新数据
              this.$store.commit('clearState')
              util.initRouter(this)
              this.loading = false
            }
          })
        }
      })
    },

    // 删除
    deleteNode () {
      if (this.checkedList.length === 0) {
        this.$Message.warning('请勾选要删除的节点')
      } else {
        console.log(this.checkedList)
        // <= 2区分多选和单选 2是特殊情况
        if (this.checkedList.length <= 2) {
          let item = this.checkedList[0]
          // 只有一个子节点，选中子节点后会自动选中父节点，则删除该子节点
          if (item.children && item.children.length === 1) {
            item = item.children[0]
            // 执行删除
            console.log('被删除的是唯一子节点'+item.title)
            this.deleteById(item.id)
          } else if (!item.children && this.checkedList.length === 2) {
            this.$Modal.warning({
              title: '提示',
              content: `<p>每次只能删除一个节点</p>`,
            })
          } else {
            // 执行删除
            console.log('被删除的是节点'+item.title)
            this.deleteById(item.id)
          }
        } else {
          this.$Modal.warning({
            title: '提示',
            content: `<p>每次只能删除一个节点</p>`,
          })
        }
      }
    },
    deleteById(id) {
      this.$http({
        method: 'delete',
        url: 'page',
        data: {id: id}
      }).then(res => {
        if (res.data.Code === 0) {
          this.$Message.success('删除成功')
          this.$store.commit('clearState')
          util.initRouter(this)
        } else {
          this.$Modal.error(res.data.Message)
        }
      })
    },
    // 清除缓存。。。
    clearMenuStore () {
      util.clearState(this, {
        clearAll: false,
        clearList: ['allMenuList', 'menuSource', 'menuListSource']
      })
    },
    // formData.path改变，处理外链操作
    inputPath (form) {
      if (form === 'newForm') {
        let path = this.newForm.path.trim()
        if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
          this.newForm.component = 'website'
        } else {
          if (this.newForm.component === 'website') {
            this.newForm.component = ''
          }
        }
      } else {
        let path = this.formData.path.trim()
        if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
          this.formData.component = 'website'
        } else {
          if (this.formData.component === 'website') {
            this.formData.component = ''
          }
        }
      }
    }
  }
}
</script>

<style scoped>
@import "../system.less";
</style>
