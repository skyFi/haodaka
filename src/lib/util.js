'use strict'

const wepy = require('wepy').default
const config = require('../common/config')
const _ = require('lodash')

module.exports = {

  /**
   * 日志收集
   * @param {object} log
   */
  recordLogSync(log) {
    console.log('##日志：', log);
    let logs = wepy.$instance.globalData.logs
    if (!logs) logs = []
    const logData = {
      type: log.type,
      message: log.message,
      timestamp: +Date.now()
    }
    if (log.stack) {
      logData.stack = log.stack
    } 
    logs.push(logData)
    wepy.$instance.globalData.logs = logs
  },

  /**
   * 所有可授权列表(https://mp.weixin.qq.com/debug/wxadoc/dev/api/authorize-index.html) 
   * 2017-12-15 14:01:13
   */
  allScopes: {
    用户信息: 'scope.userInfo',
    地理位置: 'scope.userLocation',
    通讯地址: 'scope.address',
    发票抬头: 'scope.invoiceTitle',
    微信运动步数: 'scope.werun',
    录音功能: 'scope.record',
    保存到相册: 'scope.writePhotosAlbum',
    摄像头: 'scope.camera'
  },

  /**
   * 授权
   * @param {string[]} scopes
   */
  async authorizeScopes(scopeNames = [], isMustAuthrize = false) {
    const setting = await wepy.getSetting()
    scopeNames.forEach(async scopeName => {
      // 授权未授权信息
      if (!setting.authSetting[scopeName]) {
        if (!this.allScopes[scopeName]) {
          this.recordLogSync({
            type: 'error',
            message: `授权参数错误【${scopeName}】：${this.allScopes[scopeName]}`
          })
        }
        try {
          await wepy.authorize({ scope: this.allScopes[scopeName] })
        } catch (e) {
          // 拒绝授权则尝试打开设置页面
          if (e.errMsg === 'authorize:fail auth deny') {
            try {
              // 尝试打开设置页面
              const setting = await wepy.openSetting()

              console.log(`设置页面之后：【${scopeName}】`, setting && setting.authSetting[this.allScopes[scopeName]])
              // 仍然拒绝授权
              if (setting && setting.authSetting[this.allScopes[scopeName]] === false) {
                this.recordLogSync({
                  type: 'error',
                  message: `用户仍然拒绝授权【${scopeName}】`,
                })

                // 强制获取
                if (isMustAuthrize) {
                  if (scopeName === '用户信息') {
                    await this.getUserInfo()
                  }

                  if (scopeName === '地理位置') {
                    await this.getLocation()
                  }
                }
              }
            } catch (error) {
              if (error.errMsg && error.errMsg.indexOf('auth deny') !== -1) {
                this.recordLogSync({
                  type: 'error',
                  message: `用户仍然拒绝授权【${scopeName}】： ${error.errMsg || error.message}`,
                  stack: error.stack
                })
              } else {
                this.recordLogSync({
                  type: 'error',
                  message: `打开设置页面时出错： ${error.errMsg || error.message}`,
                  stack: error.stack
                })
              }
            }
          } else {
            this.recordLogSync({
              type: 'error',
              message: `授权【${scopeName}】出错： ${e.errMsg || e.message}`,
              stack: e.stack
            })
          }
        }
      }
    })
  },

  /**
   * 收集，统计分享信息
   * @param {object} res
   */
  async recordOnShare(res) {
    // 记录日志
    this.recordLogSync({
      type: 'share',
      message: `转发自[${res.from}]`
    })
  },

  /**
   * 登录
   */
  async login() {
    try {
      const sessionToken = wepy.getStorageSync('session_token')
      const uid = wepy.getStorageSync('uid')
      console.log({sessionToken, uid})
      // 当前未登录
      if (!sessionToken || !uid) {
        // 检测授权状态
        const setting = await wepy.getSetting()
        // 未授权用户信息
        if (setting && setting.authSetting && !setting.authSetting['scope.userInfo']) {
          await this.getUserInfo()
        } else {
          // 检测用户登录态是否失效
          await wepy.checkSession()
        }
        // 登录服务器
        await _login()
      } 
      // 当前已经登录，判断用户登录态
      else {
        await wepy.checkSession()
      }
    } catch (error) {
      console.log('登录态失效，重新登录', error)
      await _login()
    }
  },

  /**
   * 获取用户详细信息
   */
  async getUserInfo() {
    const dataUserInfo = wepy.$instance.globalData.userInfo
    if (dataUserInfo) {
      console.log('用户信息', dataUserInfo)
      return dataUserInfo
    }
    // 获取微信用户信息
    try {
      const userInfo = await wepy.getUserInfo({
        withCredentials: true,  // 带上登录信息
        lang: 'zh_CN' // 简体中文
      })
      console.log('拿到了用户信息', userInfo)
      wepy.$instance.globalData.userInfo = userInfo
      return userInfo
    } catch (error) {
      if (error.errMsg === 'getUserInfo:fail auth deny') {
        this.recordLogSync({
          type: 'error',
          message: `【用户信息】没有授权： ${error.errMsg}`,
        })
        // 打开对话框，友好提示用户
        await wepy.showModal({
          title: '微信授权',
          content: '为了更好的为您服务，我们希望能获取您的微信公开用户信息（昵称，头像等）。',
          confirmText: '设置',
          confirmColor: '#1aad16',
          showCancel: false
        })
        // 不管是确定还是取消都再次尝试授权用户信息
        await this.authorizeScopes(['用户信息'], true)
      }
      return null
    }
  },

  /**
   * 获取地址授权
   */
  async getLocation() {
    const userLocation = wepy.$instance.globalData.userLocation
    if (userLocation) {
      console.log('拿到了地理位置', userLocation)
      return userLocation
    }

    try {
      const location = await wepy.getLocation({
        type: 'wgs84' // 默认为 `wgs84` 返回 `gps` 坐标，`gcj02` 返回可用于`wx.openLocation`的坐标
      })
      wepy.$instance.globalData.userLocation = location
      console.log('拿到了地理位置', location)
      return location
    } catch (error) {
      // 拒绝授权地理位置权限
      if (error.errMsg === 'getLocation:fail auth deny') {
        this.recordLogSync({
          type: 'error',
          message: `【地理位置】没有授权： ${error.errMsg}`,
        })
        // 打开对话框，友好提示用户
        await wepy.showModal({
          title: '微信授权',
          content: '为了更好的为您服务，我们希望能获取您当前的位置信息以便精诚为您服务。',
          confirmText: '设置',
          confirmColor: '#1aad16',
          showCancel: false
        })

        await this.authorizeScopes(['地理位置'])
      }
    }
    return null
  }
}

// 调用前先确保已经授权用户信息
async function _login() {
  try {
    // 登录微信接口拿取code，不管有没有授权都会返回code
    const loginRes = await wepy.login()
    const code = loginRes.code //（有效期五分钟）
    // code换取服务器session_key,uid等信息
    if (code) {
      console.log('获取微信登录code：', { code })
      // 获取用户详细信息
      const userInfo = await module.exports.getUserInfo() // 第一次默认系统会校验授权
      if (userInfo) {
        // 用户授权后则请求服务器登录，拿取openid和sessionKey
        const res = await wepy.request({
          url: `${config.api.default}/wxapp/login`,
          method: 'POST',
          data: { code }
        })
        console.log('登录，服务器返回值：', res)
        const data = res.data || {}
        // 换取成功，保存session_key到本地
        if (`${data.code}` === '0') {
          const sessionToken = data.data.sessionToken
          const uid = data.data.uid // openid 的 md5 可做用户的唯一标识码
          wepy.setStorage({
            key: 'session_token',
            data: sessionToken
          })
          wepy.setStorage({
            key: 'uid',
            data: uid
          })
        } else { // 换取失败，记录错误日志
          module.exports.recordLogSync({
            type: 'error',
            message: `code换取session失败: ${data.code} => ${data.msg}`,
            stack: _.get(data, 'err.pos')
          })
        }
      }
    } else {
      module.exports.recordLogSync({
        type: 'error',
        message: `获取用户登录态 code 失败`
      })
    }

  } catch (error) {
    module.exports.recordLogSync({
      type: 'error',
      message: `尝试登录出错： ${error.errMsg || error.message}`,
      stack: error.stack
    })
  }
}
