import Main from '@/components/main'

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
  path: '/login',
  name: 'login',
  meta: {
    title: '登录 - 黑鲨开发管理平台 '
  },
  component: () => import('@/view/login/login.vue')
}

// export const page404 = {
//     path: '/*',
//     name: 'error-404',
//     meta: {
//         title: '404-页面不存在'
//     },
//     component: () => import('@/view/error-page/404.vue')
// };

export const page401 = {
  path: '/401',
  name: 'error_401',
  meta: {
    title: '401'
  },
  component: () => import('@/view/error-page/401.vue')
}

export const page500 = {
  path: '/500',
  meta: {
    title: '500-服务端错误'
  },
  name: 'error-500',
  component: () => import('@/view/error-page/500.vue')
}

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
// 假如系统有一些固定页面如欢迎页等，可预设置在这里
export const otherRouter = {
  path: '/otherRouter',
  name: 'otherRouter',
  redirect: '/',
  component: Main,
  children: [
    // { path: 'home', meta: { title: '首页' }, title: '首页', name: 'home', component: () => import('@/view/single-page/home') }
    // { path: 'change-pass', title: '修改密码', name: 'change_pass', component: () => import('@/view/change-pass/change-pass.vue') }
    // { path: 'ownspace', title: '个人中心', name: 'ownspace_index', component: () => import('@/view/own-space/own-space.vue') },
    // { path: 'message', title: '消息中心', name: 'message_index', component: () => import('@/view/message/message.vue') },
    // { path: 'message-send-detail', title: '消息发送详情', name: 'message_send_detail', component: () => import('@/view/sys/message-manage/messageSendDetail.vue') }
  ]
}

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
// export const appRouter = [
//     {
//         path: '/form',
//         icon: 'ios-gear',
//         name: 'sys',
//         title: '系统管理',
//         component: Main,
//         children: [
//             { path: 'user-manage', title: '用户管理', name: 'user-manage', icon: 'android-person', component: () => import('@/view/sys/user-manage/userManage') },
//             { path: 'role-manage', title: '角色管理', name: 'role-manage', icon: 'android-contacts', component: () => import('@/view/sys/role-manage/roleManage.vue') },
//             { path: 'menu-manage', title: '菜单管理', name: 'menu-manage', icon: 'navicon-round', component: () => import('@/view/sys/menu-manage/menuManage.vue') },
//             { path: 'log-manage', title: '日志管理', name: 'log-manage', icon: 'android-list', component: () => import('@/view/sys/log-manage/logManage.vue') }
//         ]
//     }
// ];

export const appRouter = []

// 所有上面定义的路由都要写在下面的routers里
export const routes = [
  loginRouter,
  otherRouter,
  ...appRouter,
  page500,
  page401
]
