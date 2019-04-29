import axios from 'axios'
import lazyLoading from './lazyLoading.js'
import router from '@/router/index'
import Cookies from 'js-cookie'
import { forEach } from '../../../libs/tools'

let util = {

}

util.title = function (title) {
  title = title || '黑鲨开发管理平台'
  window.document.title = title
}

util.inOf = function (arr, targetArr) {
  let res = true
  arr.forEach(item => {
    if (targetArr.indexOf(item) < 0) {
      res = false
    }
  })
  return res
}

util.oneOf = function (ele, targetArr) {
  if (targetArr.indexOf(ele) >= 0) {
    return true
  } else {
    return false
  }
}

util.getRouterObjByName = function (routers, name) {
  if (!name || !routers || !routers.length) {
    return null
  }
  // debugger;
  let routerObj = null
  for (let item of routers) {
    if (item.name === name) {
      return item
    }
    routerObj = util.getRouterObjByName(item.children, name)
    if (routerObj) {
      return routerObj
    }
  }
  return null
}

util.handleTitle = function (vm, item) {
  if (typeof item.title === 'object') {
    return vm.$t(item.title.i18n)
  } else {
    return item.title
  }
}
/*
util.setCurrentPath = function (vm, name) {
  let title = ''
  let isOtherRouter = false
  vm.$store.state.app.routers.forEach(item => {
    if (item.children.length === 1) {
      if (item.children[0].name === name) {
        title = util.handleTitle(vm, item)
        if (item.name === 'otherRouter') {
          isOtherRouter = true
        }
      }
    } else {
      item.children.forEach(child => {
        if (child.name === name) {
          title = util.handleTitle(vm, child)
          if (item.name === 'otherRouter') {
            isOtherRouter = true
          }
        }
      })
    }
  })
  let currentPathArr = []
  if (name === 'home') {
    currentPathArr = [
      {
        title: util.handleTitle(vm, util.getRouterObjByName(vm.$store.state.app.routers, 'home')),
        path: '',
        name: 'home'
      }
    ]
  } else if ((name.indexOf('home') >= 0 || isOtherRouter) && name !== 'home') {
    currentPathArr = [
      {
        title: util.handleTitle(vm, util.getRouterObjByName(vm.$store.state.app.routers, 'home')),
        path: '/home',
        name: 'home'
      },
      {
        title: title,
        path: '',
        name: name
      }
    ]
  } else {
    let currentPathObj = vm.$store.state.app.routers.filter(item => {
      if (item.children.length <= 1) {
        return item.children[0].name === name
      } else {
        let i = 0
        let childArr = item.children
        let len = childArr.length
        while (i < len) {
          if (childArr[i].name === name) {
            return true
          }
          i++
        }
        return false
      }
    })[0]
    if (currentPathObj.children.length <= 1 && currentPathObj.name === 'home') {
      currentPathArr = [
        {
          title: '首页',
          path: '',
          name: 'home'
        }
      ]
    } else if (currentPathObj.children.length <= 1 && currentPathObj.name !== 'home') {
      currentPathArr = [
        {
          title: '首页',
          path: '/home',
          name: 'home'
        },
        {
          title: currentPathObj.title,
          path: '',
          name: name
        }
      ]
    } else {
      let childObj = currentPathObj.children.filter((child) => {
        return child.name === name
      })[0]
      currentPathArr = [
        {
          title: '首页',
          path: '/home',
          name: 'home'
        },
        {
          title: currentPathObj.title,
          path: '',
          name: currentPathObj.name
        },
        {
          title: childObj.title,
          path: currentPathObj.path + '/' + childObj.path,
          name: name
        }
      ]
    }
  }
  vm.$store.commit('setCurrentPath', currentPathArr)

  return currentPathArr
}
*/
util.openNewPage = function (vm, name, argu, query) {
  let pageOpenedList = vm.$store.state.app.pageOpenedList
  let openedPageLen = pageOpenedList.length
  let i = 0
  let tagHasOpened = false
  while (i < openedPageLen) {
    if (name === pageOpenedList[i].name) { // 页面已经打开
      vm.$store.commit('pageOpenedList', {
        index: i,
        argu: argu,
        query: query
      })
      tagHasOpened = true
      break
    }
    i++
  }
  if (!tagHasOpened) {
    let tag = vm.$store.state.app.tagsList.filter((item) => {
      if (item.children) {
        return name === item.children[0].name
      } else {
        return name === item.name
      }
    })
    tag = tag[0]
    if (tag) {
      tag = tag.children ? tag.children[0] : tag
      if (argu) {
        tag.argu = argu
      }
      if (query) {
        tag.query = query
      }
      vm.$store.commit('increateTag', tag)
    }
  }
  vm.$store.commit('setCurrentPageName', name)
}

util.toDefaultPage = function (routers, name, route, next) {
  let len = routers.length
  let i = 0
  let notHandle = true
  while (i < len) {
    if (routers[i].name === name && routers[i].children && routers[i].redirect === undefined) {
      route.replace({
        name: routers[i].children[0].name
      })
      notHandle = false
      next()
      break
    }
    i++
  }
  if (notHandle) {
    next()
  }
}

util.fullscreenEvent = function (vm) {
  vm.$store.commit('initCachepage')
}

util.sort = function (list) {
  return list.sort(function (a, b) {
    return a.order - b.order
  })
}

util.getPermission = function (resData, vm) {
  // 原始数据列表，可缓存
  let resDataList = resData
  resDataList.forEach(item => {
    // 将数值换位布尔
    item.hideInMenu = !!item.hideInMenu
  })
  vm.$store.commit('saveMenuSource', resDataList)

  // 列表镜像，可修改，不会影响原始数据
  let editResDataList = util.arrDeepCopy(resDataList)
  editResDataList.forEach(item => {
    if (item.isHomePage) {
      vm.$store.commit('updateHomePath', item.path)
      vm.$store.commit('setHomeName', item.name)
    }
  })

  // 找到菜单的children
  let getChild = function (item) {
    let child = []
    let list = util.arrDeepCopy(resDataList)
    list.forEach((r, i) => {
      if (r.parentId && item.id === r.parentId) {
        child.push(r)
        list.splice(i, 1, {})
        editResDataList.splice(i, 1, {})
      }
    })
    if (child.length > 0) {
      item.children = util.sort(child)
      item.redirect = item.children[0].path // 如果为父页面重定向到其直接子节点
      item.children.forEach(c => {
        getChild(c)
      })
    } else {
      // 用于处理没有子菜单的一级菜单
      // 此处暂不执行
      /*
      if (item.parentId === 0) {
        item.children = [{
          component: item.component,
          hideInMenu: item.hideInMenu,
          icon: item.icon,
          id: null,
          level: item.level,
          sortLevel: item.sortLevel + 1,
          name: item.name + '_copy',
          order: item.order,
          parentId: item.id,
          path: item.path,
          title: item.title
        }]
        item.name = item.name + '_'
        item.component = 'Main'
      }
      */
    }
  }

  editResDataList.forEach(item => {
    item.notCache = true
    getChild(item)
  })
  let result = util.sort(editResDataList.filter(t => { return t.id }))

  // console.log(result)
  // 处理三级菜单，最高支持三级菜单
  result.forEach(r => {
    if (r.children && r.children.length > 0) {
      r.children.forEach(f => {
        if (f.children && f.children.length > 0) {
          f.component = 'parentView'
          r.meta = { showAlways: true }
        }
      })
    }
  })

  return result
}

util.initRouter = function (vm) {
  const constRoutes = []
  const otherRoutes = []
  // let menuData = util.getStorage({key: 'menus', type: 'session'})
  let menuData = null

  // 404路由需要和动态路由一起注入
  const otherRouter = [{
    path: '/*',
    name: 'error-404',
    meta: {
      title: '404-页面不存在'
    },
    component: 'error-page/404'
  }]
  const mainRedirect = {
    path: '/',
    name: 'home',
    meta: {title: '首页'},
    redirect: '',
    component: 'Main',
  }

  // 判断用户是否登录
  let userInfo = Cookies.get('token')
  if (userInfo === null || userInfo === '' || userInfo === undefined) {
    // 未登录
    return
  }

  if (!menuData || menuData === '') {
    axios.get('pages?page=1&limit=100').then(res => {
      if (res.data.Code === 0) {
        console.info('查询菜单')
        res.data.Data = res.data.Data || []
        menuData = util.getPermission(res.data.Data, vm)
        // 设置登录后首页path，若无则默认第一个path
        mainRedirect.redirect = vm.$store.state.appp.homePath || menuData[0].path
        if (vm.$store.state.appp.homeName === '') {
          vm.$store.commit('setHomeName', menuData[0].name)
        }
        otherRouter.unshift(mainRedirect)

        vm.$store.commit('saveMenuListSource', menuData)
        if (menuData === null || menuData === '' || menuData === undefined) {
          return
        }
        util.setStorage({ key: 'menus', data: JSON.stringify(menuData), type: 'session' })
        util.afterGetMenus(constRoutes, otherRoutes, menuData, otherRouter, vm)
      }
    })
  } else {
    util.afterGetMenus(constRoutes, otherRoutes, menuData, otherRouter, vm)
  }
}

util.afterGetMenus = function (constRoutes, otherRoutes, menuData, otherRouter, vm) {
  util.initRouterNode(constRoutes, menuData)
  util.initRouterNode(otherRoutes, otherRouter)
  // 添加主界面路由
  vm.$store.commit('updateAppRouter', constRoutes.filter(item => item.children && item.children.length > 0))
  // 添加全局路由
  vm.$store.commit('updateDefaultRouter', otherRoutes)
  // 刷新界面菜单
  vm.$store.commit('updateMenulist', constRoutes.filter(item => item.children && item.children.length > 0))

  let tagsList = []
  vm.$store.state.appp.routers.map((item) => {
    if (item.children.length <= 1) {
      tagsList.push(item.children[0])
    } else {
      tagsList.push(...item.children)
    }
  })
  vm.$store.commit('setTagsList', tagsList)
}

// 生成路由节点
util.initRouterNode = function (routers, data) {
  for (var item of data) {
    let menu = Object.assign({}, item)
    menu.component = lazyLoading(menu.component)

    if (item.children && item.children.length > 0) {
      menu.children = []
      util.initRouterNode(menu.children, item.children)
    }

    let meta = menu.meta || {}
    // 给页面添加权限、标题、第三方网页链接
    meta.permTypes = menu.permTypes ? menu.permTypes : null
    meta.title = menu.title ? menu.title : null
    meta.url = menu.url ? menu.url : null
    meta.hideInMenu = menu.hideInMenu || false
    if (menu.href) {
      meta.href = menu.href
    }
    menu.meta = meta

    routers.push(menu)
  }
}

// config = {key, data, type}
util.setStorage = function (config) {
  if (config.type === 'session') {
    window.sessionStorage.setItem(config.key, config.data)
  } else {
    window.localStorage.setItem(config.key, config.data)
  }
}

util.getStorage = function (config) {
  let res
  if (config.type === 'session') {
    res = window.sessionStorage.getItem(config.key)
  } else {
    res = window.localStorage.getItem(config.key)
  }
  return JSON.parse(res)
}

util.removeStorage = function (config) {
  if (config.type === 'session') {
    window.sessionStorage.removeItem(config.key)
  } else {
    window.localStorage.removeItem(config.key)
  }
}

// 数组深拷贝
util.arrDeepCopy = function (arr) {
  return arr.map((obj) => {
    obj = Object.assign({}, obj)
    Object.getOwnPropertyNames(obj).forEach((key) => {
      if (typeof obj[key] === 'object' && obj[key] && obj[key].length) {
        obj[key] = this.arrDeepCopy(obj[key])
      }
    })
    return obj
  })
}

// 查询角色数据
util.queryRoles = function (vm, callback) {
  axios.get('/roles').then(res => {
    if (res.data.Code === 0){
      vm.$store.commit('updateRoles', res.data.Data)
      typeof callback === 'function' && callback(res)
    } else {
      vm.$Message.error('角色数据查询失败，请重试！')
    }
  })
}

// 清除缓存
/**
 * @param vm
 * @param config = {clearAll: Boolean, clearList:
 * ['levels', 'roles', 'allMenuList', 'menuList', 'menuSource', 'menuListSource']}
 */
util.clearState = function (vm, config) {
  config = config || {}
  if (config.clearAll) {
    vm.$store.commit('clearState')
  } else {
    if (config.clearList) {
      config.clearList.forEach(item => {
        let type = 'clear' + item
        vm.$store.commit(type)
      })
    }
  }
}

// 字符串首字母大写
util.strUpper = function (str) {
  let res = str.split('')
  res.unshift(res.shift().toUpperCase())
  return res.join('')
}
// 字符串首字母小写
util.strLower = function (str) {
  let res = str.split('')
  res.unshift(res.shift().toLowerCase())
  return res.join('')
}

// 将Object中的全部属性首字母改为大写
// 常用于前后端数据交互时参数的处理，所以不作深入转换，仅第一层key生效
util.toUpperCase = function (object) {
  let res = {}
  for (let o in object) {
    res[util.strUpper(o)] = object[o]
  }
  return res
}
util.toLowerCase = function (object) {
  let res = {}
  for (let o in object) {
    res[util.strLower(o)] = object[o]
  }
  return res
}

export default util
