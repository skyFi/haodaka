<style lang="less">

</style>

<template lang="wxml">
  <web-view src="https://xxd.smartstudy.com/">
  </web-view>
</template>

<script>
  import wepy from 'wepy'
  import savefids from 'mixins/savefids'
  export default class Xxd extends wepy.page {
    config = {
      navigationBarTitleText: '智课选校帝',
      enablePullDownRefresh: true
    }
    mixins = [savefids]
    async onLoad() {
      const userInfo = await wepy.getUserInfo()
      console.log('onload: ', userInfo)
    }
  }
</script>
