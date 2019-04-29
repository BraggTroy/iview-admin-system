<template>
  <!--页面权限设置-->
  <div class="system-container">
    <div>
      <Row class="search-bar">
        <i-col :span="24">
          <Button style="margin-right: 30px" type="primary" icon="md-add"
                  @click="submitRolePermission">保 存</Button>
          <Checkbox @on-change="choseAll">全 选</Checkbox>
        </i-col>
      </Row>
      <Row class="permission-group" type="flex" :gutter="15">
        <i-col :span="4" :xxl="3" class="per-left">
          <div class="role-wrap" :class="{'active': currentRole.id === r.id}"
               @click="getPermission(r)" v-for="r in roleList" :key="r.id">
            <Icon type="md-pricetag" size="16"/> {{r.roleName}}
          </div>
        </i-col>
        <!--右侧树-->
        <i-col :span="20" :xxl="21">
          <!--一级菜单循环-->
          <!--false-value 格式：0-id -->
          <div class="page-group" v-for="m in menuList">
            <div class="page-parent">
              <!--一级标题-->
              <Checkbox @on-change="choseChildren" v-model="m.checked" :true-value="m.id" :false-value="0 + '-' + m.id">{{m.title}}</Checkbox>
            </div>
            <div class="page-children">
              <!--一级子页面-->
              <span v-for="c in m.children">
                <Checkbox @on-change="choseItem" v-model="c.checked" :true-value="c.id" :false-value="0 + '-' + c.id" v-if="c.component.toUpperCase() !== 'PARENTVIEW'">{{c.title}} {{c.checked}}</Checkbox>
                <!--子页面的children循环-->
                <div v-else>
                  <div class="page-parent">
                    <!--子标题-->
                    <Checkbox @on-change="choseBindChildren" v-model="c.checked" :true-value="c.id" :false-value="0 + '-' + c.id">{{c.title}}</Checkbox>
                  </div>
                  <div class="page-children">
                    <Checkbox @on-change="choseItem" v-for="md in c.children" v-model="md.checked" :true-value="md.id" :false-value="0 + '-' + md.id">{{md.title}}</Checkbox>
                  </div>
                </div>
              </span>

            </div>
          </div>

          <div class="">



            <!--<Tree :data="menuList" class="permission-tree" @on-select-change="onSelect"-->
                  <!--@on-check-change="onChecked" show-checkbox></Tree>-->


          </div>
        </i-col>
      </Row>
      {{permission}}
    </div>
  </div>
</template>

<script>
  import util from '../libs/util'
  export default {
    name: '',
    data () {
      return {
        roleList: [],
        permission: [],
        currentRole: {},
        menuList: [],
        currentMenu: {},
      }
    },
    mounted () {
      // 初始化角色
      this.roleList = this.$store.state.appp.roles
      if (!this.roleList) {
        let this_ = this
        util.queryRoles(this_, function (res) {
          this_.roleList = res.data.Data || []
          this_.getPermission(this_.roleList[0])
        })
      } else {
        this.getPermission(this.roleList[0])
      }

      // 初始化menuList
      let menuList_back = this.$store.state.appp.menuListSource.map(t => {
        let res = JSON.parse(JSON.stringify(t))
        res.checked = '0-' + res.id
        if (res.children) {
          res.children.forEach(r => {
            r.checked = '0-' + r.id
            if (r.children) {
              r.children.forEach(rc => rc.checked = '0-' + rc.id)
            }
          })
        }
        return res
      })
      this.menuList = util.arrDeepCopy(menuList_back)
    },
    methods: {
      // 自动勾选
      checkedMenu (list, ids) {
        list.forEach(l => {
          l.checked = '0-' + l.id
          if (ids.includes(l.id)) {
            l.checked = l.id
            this.permission.push(l.id)
            if (l.children && l.children.length) {
              this.checkedMenu(l.children, ids)
            }
          } else {
            if (l.children && l.children.length) {
              this.checkedMenu(l.children, ids)
            }
          }
        })
      },
      // 切换角色
      getPermission (role) {
        if (role) {
          this.currentRole = role
        }
        this.$http({
          method: 'get',
          url: `/rolepages?role_id=${this.currentRole.id}&page=1&limit=100`,
        }).then(res => {
          if (res.data.Code === 0) {
            // choose_flag === 1则表示该数据被选中
            let list = res.data.Data || []
            list = list.filter(l => l.choose_flag).map(item => {return item.id})
            this.permission = []
            this.checkedMenu(this.menuList, list)
          }
        })
      },
      // 重置并记录数据
      resetMenu (list, bl) {
        list.forEach(m => {
          // 赋值
          m.checked = bl ? m.id : '0-' + m.id
          // 记录
          if (bl) {//加
            if (!this.permission.includes(m.id)) this.permission.push(m.id)
            if (!this.permission.includes(m.parentId)) this.permission.push(m.parentId)
          } else {//减
            let index = this.permission.indexOf(m.id)
            if (index >= 0) this.permission.splice(index, 1)
            let index2 = this.permission.indexOf(m.parentId)
            if (index2 >= 0) this.permission.splice(index2, 1)
          }
          if (m.children && m.children.length > 0) {
            this.resetMenu(m.children, bl)
          }
        })
      },
      // 全选
      choseAll (val) {
        this.resetMenu(this.menuList, val)
      },
      // 勾选父级（一级）则选中全部子节点
      choseChildren (id) {
        let bl = true
        if (id.toString().match('-')) { // 取消全选
          bl = false
          id = Number(id.split('-')[1])
        }
        let len = this.menuList.length
        let arr = []
        for (let i = 0; i < len; i++) {
          if (this.menuList[i].id == id) {
            arr = this.menuList[i].children || []
            this.resetMenu(arr, bl)
            break
          }
        }
      },
      // 二级节点点击全部选中子节点
      choseBindChildren (id) {
        let bl = true
        if (id.toString().match('-')) { // 取消全选
          bl = false
          id = Number(id.split('-')[1])
        }
        let len = this.menuList.length
        let arr = []
        for (let i = 0; i < len; i++) {
          if (this.menuList[i].children) {
            let childs = this.menuList[i].children
            for (let c = 0; c < childs.length; c++) {
              if (childs[c].id == id) {
                arr = childs[c].children || []
                this.resetMenu(arr, bl)
                this.whetherChoseParent(id, bl)
                break
              }
            }
          }
        }
      },
      choseItem (id) {
        let bl = true
        if (id.toString().match('-')) { // 取消全选
          bl = false
          id = Number(id.split('-')[1])
        }
        if (bl) {
          this.permission.push(id)
        }
        else {
          this.permission.splice(this.permission.indexOf(id), 1)
        }

        this.whetherChoseParent(id, bl)

      },
      // 调用此方法，则说明id必定是子节点
      whetherChoseParent (id, bl) {
        let one = false  // true 表示有选中项
        let two = false

        let node = this.$store.state.appp.menuSource.filter(m => m.id === id)[0]
        console.table(JSON.parse(JSON.stringify(node)))
        console.info(bl)
        // 选中则其全部父节点选中
        if (bl) {

          this.menuList.forEach(m => {
            if (m.id === node.parentId) {
              m.checked = m.id
              if (!this.permission.includes(m.id)) this.permission.push(m.id)
            } else {
              if (m.children) {
                m.children.forEach(mc => {
                  if (mc.id === node.parentId) {
                    mc.checked = mc.id
                    m.checked = m.id
                    if (!this.permission.includes(mc.id)) this.permission.push(mc.id)
                    if (!this.permission.includes(m.id)) this.permission.push(m.id)
                  }
                })
              }
            }
          })
        }
        // 不选中，则判断是否需要取消父节点的选中
        else {
          this.menuList.forEach(m => {
            if (node.menuLevel === 1) {
              if (m.id === node.parentId) {
                let allUnChecked = true
                m.children.forEach(mc => {
                  if (mc.checked === mc.id) {
                    allUnChecked = false
                  }
                })
                if (allUnChecked) {
                  let idx = this.permission.indexOf(node.parentId)
                  idx >= 0 && this.permission.splice(idx, 1)
                  m.checked = '0-' + m.id
                }
              }
            }
            else if (node.menuLevel === 2) {
              m.children.forEach(mc => {
                if (mc.id === node.parentId) { // 找到当前二级节点
                  let mcdAllUnChecked = true
                  mc.children.forEach(mcd => {
                    if (mcd.checked === mcd.id) {
                      mcdAllUnChecked = false
                    }
                  })
                  if (mcdAllUnChecked) {
                    mc.checked = '0-' + mc.id
                    let idx = this.permission.indexOf(node.parentId)
                    idx >= 0 && this.permission.splice(idx, 1)
                    //
                    let allUnChecked = true
                    m.children.forEach(mc => {
                      if (mc.checked === mc.id) {
                        allUnChecked = false
                      }
                    })
                    if (allUnChecked) {
                      let idx2 = this.permission.indexOf(m.id)
                      idx2 >= 0 && this.permission.splice(idx2, 1)
                      m.checked = '0-' + m.id
                    }
                    //
                  }
                }

              })

            }
          })
        }

        return;

        this.menuList.forEach(m => {
          if (m.children && m.children.length) {
            m.children.forEach(mc => { //一级
              if (mc.id === id) {
                console.log(id, mc.id)
                one = true
                m.checked = m.id
                if (!this.permission.includes(m.id)) this.permission.push(m.id)
              } else {
                return
                if(mc.children && mc.children.length) {
                  mc.children.forEach(mcd => { //二级
                    if (mcd.id === id) {
                      if (bl) {
                        two = true
                        mc.checked = mc.id
                        console.log(m)
                        m.checked = m.id
                        console.log(m)
                        if (!this.permission.includes(m.id)) this.permission.push(m.id)
                        if (!this.permission.includes(mc.id)) this.permission.push(mc.id)
                      }
                    }
                    if (mcd.checked === mcd.id) two = true
                  })
                  if (!two) {
                    mc.checked = '0-' + mc.id
                    m.checked = '0-' + m.id
                    let idx = this.permission.indexOf(mc.id)
                    if (idx >= 0) this.permission.splice(idx, 1)
                    let idx2 = this.permission.indexOf(m.id)
                    if (idx2 >= 0) this.permission.splice(idx2, 1)
                  }
                }
              }
            })


            if (!one) {
              console.log('m reset')
              m.checked = '0-' + m.id
              let idx = this.permission.indexOf(m.id)
              if (idx >= 0) this.permission.splice(idx, 1)
            }
          }
        })

      },
      // 提交角色权限设置
      submitRolePermission () {
        this.$http({
          method: 'post',
          url: '/rolepages',
          data: {
            RoleId: this.currentRole.id,
            PageIds: this.permission
          }
        }).then(res => {
          if (res.data.Code === 0) {
            this.$Message.success('保存成功')
          }
        })

      }

    }
  }
</script>

<style scoped lang="less">
  @import "../system.less";

  .role-wrap{
    user-select: none;
    cursor: pointer;
    padding: 10px;
    margin-bottom: 5px;
    transition: all .2s;
    background: @background;
    i {
      color: #ccc;
    }
    &.active{
      background: #2d8cf0;
      color: #fff;
      i {
        color: #fff;
      }
    }
  }
  .tree-box{
    padding-left: 10px;
    max-height: 800px;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .page-group{
    margin-bottom: 30px;
    .page-parent{
      border-left: 5px solid #7fbaf9;
      line-height: 26px;
      height: 26px;
      margin-bottom: 15px;
      background: #f9fcff;
      padding-left: 10px;
    }
    .page-children{
      padding-left: 30px;
      .ivu-checkbox-wrapper{
        margin-bottom: 10px;
      }
      .page-parent{
        margin-top: 5px;
      }
    }
  }
</style>
