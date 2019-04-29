
export default (url) => () => {
  let upUrl = url.toUpperCase()
  if (upUrl !== 'MAIN' && upUrl !== 'PARENTVIEW' && upUrl !== 'WEBSITE') {
    return import(`@/view/${url}.vue`)
  } else if (upUrl === 'MAIN') {
    return import('@/components/main')
  } else if (upUrl === 'PARENTVIEW') {
    return import('@/components/parent-view')
  } else if (upUrl === 'WEBSITE') {
    return import('@/view/system/component/website.vue')
  }
}
