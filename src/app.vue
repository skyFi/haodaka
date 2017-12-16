<style lang="less">
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    box-sizing: border-box;
  }
</style>

<script>
  import wepy from 'wepy'
  import 'wepy-async-function' // 开启async/await
  import util from 'util'
  export default class extends wepy.app {
    // 小程序配置
    config = {
      pages: [
        'pages/index',
        'pages/xxd',
        'pages/me'
      ],
      window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#39f',
        navigationBarTitleText: '智课选校帝',
        navigationBarTextStyle: 'white'
      },
      networkTimeout: {
        request: 20000,
        downloadFile: 30000,
        connectSocket: 5000
      },
      tabBar: {
        position: 'bottom',
        selectedColor: '#3399ff',
        list: [{
          pagePath: "pages/index",
          text: "首页",
          iconPath: "images/home.png",
          selectedIconPath: "images/home.png"
        }, {
          pagePath: "pages/index",
          text: "选校帝",
          iconPath: "images/home.png",
          selectedIconPath: "images/home.png"
        }, {
          pagePath: "pages/me",
          text: "我的",
          iconPath: "images/home.png",
          selectedIconPath: "images/home.png"
        }]
      }
    }
    // 全局变量默认值
    globalData = {
      userInfo: null
    }
    constructor() {
      super()
      this.use('requestfix') // fix 请求并发的内置中间键
      this.use('promisify') // 请求promise化
    }
    // 开启小程序
    async onLaunch() {
      // 登录并获取用户信息
      console.info('开始登录模块...')
      await util.login()
      // 检测全局权限（优先级最高的权限）控制，未授权的弹窗授权
      console.info('开始授权模块...')
      const setting = await wepy.getSetting()
      if (setting && setting.authSetting) {
        const needAuthorizeScopes = ['用户信息'] // 每次启动都需要校验的授权
        const unAuthorizeScopes = needAuthorizeScopes.filter(scope => !setting.authSetting[util.allScopes[scope]])
        await util.authorizeScopes(unAuthorizeScopes, true)
      }
      // 获取用户设备/系统信息
      console.info('开始获取设备信息...')
      const systemInfo = await wepy.getSystemInfo()
      console.log('系统信息', systemInfo)
    }
  }
</script>
