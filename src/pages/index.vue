<style lang="less">
  .userinfo {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .userinfo-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }
  .userinfo-nickname {
    color: #aaa;
  }
</style>

<template lang="wxml">
  <wr @wtap.user="gotoxxd">
    <view>go to xxd</view>
  </wr>
</template>

<script>
  import wepy from 'wepy'
  import savefidsMixin from 'mixins/savefids'
  import util from 'util'
  import Wrapper from '@/components/wrapper'
  export default class Index extends wepy.page {
    config = {
      navigationBarTitleText: '智课选校帝',
      enablePullDownRefresh: true,
      backgroundTextStyle: 'dark',
      backgroundColor: '#f4f5f6'
    }
    components = {
      wr: Wrapper
    }
    mixins = [savefidsMixin]
    data = {
      mynum: 20,
    }
    computed = {
      now() {
        return +new Date()
      }
    }
    methods = {
      async gotoxxd() {
        console.log('goto xxd')
        const location = await util.getLocation()
        if (location) {
          wepy.navigateTo({
            url: '/pages/xxd'
          })
        }
      },
    }
    events = {
      'index-emit': (...args) => {
        let $event = args[args.length - 1]
        console.log(`${this.$name} receive ${$event.name} from ${$event.source.$name}`)
      }
    }
    async onShow() {}
    // 转发开启器/收集器
    onShareAppMessage(res) {
      util.recordOnShare(res)
      return {
        title: `from => ${res.from}`
      }
    }
  }
</script>
