<template>
  <Modal v-model="visible" title="选择图标" footer-hide width="800">
    <Row>
      <i-col span="16" offset="4">
        <input @input="onInput" @focus="onFocus" @blur="onBlur"
               :placeholder="placeholder"
               class="icon-search-input"></input>
      </i-col>
    </Row>
    <Row class="icon-groups scrollbar" :style="{'height': height}">

      <!--全部图标循环-->
      <div @click="copyClass(i)" v-for="i in iconsList" :key="i" style="width: 20%" class="icon-wrap" >
        <Icon :type="i" />
        <p class="icon-class">{{i}}</p>
      </div>

    </Row>

  </Modal>
</template>
<script>
import icons from './icons-store'
export default {
  name: '',
  data () {
    return {
      visible: false,
      placeholder: '请输入图标关键词，如：add',
      iconsStore: [
      ],
      iconsList: [],
      height: '400px'
    }
  },
  props: {
    handleChose: Function
  },
  mounted () {
    this.height = document.body.clientHeight - 100 - 174 + 'px'
    this.iconsStore = icons
    this.iconsList = new Array(0).concat(this.iconsStore)
  },
  methods: {
    onInput (e) {
      let className = e.target.value
      this.iconsList = this.iconsStore.filter(i => {
        return i.match(className)
      })
    },
    onFocus () {
      this.placeholder = ''
    },
    onBlur () {
      this.placeholder = '请输入图标关键词，如：add'
    },
    copyClass (i) {
      this.handleChose && this.handleChose(i)
      this.visible = false
    }
  }
}
</script>

<style scoped lang="less">
.icon-search-input{
  text-align: center;
  display: block;
  width: 100%;
  background: #f5f5f5;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 8px 15px;
  &:focus {
    outline: none;
  }
}
.icon-groups{
  margin-top: 40px;
  overflow: auto;
}
  .icon-wrap{
    width: 20%;
    height: 90px;
    float: left;
    cursor: pointer;
    text-align: center;
    user-select: none;
    transition: all .2s;
    .ivu-icon{
      font-size: 32px;
    }
    .icon-class{
      font-size: 14px;
      padding: 10px 2px;
    }
    &:hover{
      color: #348EED;
    }
  }
</style>
