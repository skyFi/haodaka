import wepy from 'wepy'
import util from 'util'

export default class savefidsMixin extends wepy.mixin {
  onShow() {
    this.saveFormIds()
  }

  // 加载新页面的时候保存用户推送码
  async saveFormIds() {
    // 登录
    await util.login()
    
    const sessionToken = wepy.getStorageSync('session_token')
    const uid = wepy.getStorageSync('uid')
    const formIds = wepy.$instance.globalData.globalFormIds
    if (sessionToken && uid && formIds && formIds.length) {
      console.info('保存推送码', formIds)
      try {
        const res = await wepy.request({
          url: 'https://blablax.com',
          data: {
            sessionToken,
            uid,
            formIds: JSON.stringify(formIds)
          }
        })
        // 保存成功后清空当前本地保存的推送码
        if (res.statusCode === 200) {
          wepy.$instance.globalData.globalFormIds = []
        }
      } catch (e) {
        console.log('保存推送码失败', e)
      }
    }
  }
}
