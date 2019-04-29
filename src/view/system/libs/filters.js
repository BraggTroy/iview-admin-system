import Vue from 'vue'

window.Date.prototype.format = function (format) {
  let o = {
    'M+': this.getMonth() + 1, // month
    'd+': this.getDate(), // day
    'H+': this.getHours(), // hour
    'm+': this.getMinutes(), // minute
    's+': this.getSeconds(), // second
    'q+': Math.floor((this.getMonth() + 3) / 3), // quarter
    'S': this.getMilliseconds() // millisecond
  }

  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  }

  for (let k in o) {
    if (new RegExp('(' + k + ')').test(format)) {
      format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return format
}

// 时间格式转换，可将时间戳转为年月日等，也可将年月日转为时间戳，自动检测
Vue.filter('time', function (val, format) {
  if (!val) {
    return val
  }
  // 没有设置格式
  if (!format) {
    // 判断是否为时间戳，是则转为格式化
    if (/^[0-9]{0,}$/.test(val)) {
      format = 'yyyy-MM-dd'
      return new Date(val).format(format)
    } else {
      // 不是时间戳，则转为时间戳
      return new Date(Date.parse(val.replace(/-/g, '/'))).getTime()
    }
  } else {
    return new Date(val).format(format)
  }
})
