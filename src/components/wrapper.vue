<style lang="less">
  .btn {
    display: block;
    padding: 0;
    margin: 0;
    border: none;
    text-align: left;
    line-height: 1.5;
    outline: none;
    appearance: none;
  }
</style>

<template lang="wxml">
  <form @submit="formSubmit" report-submit>
    <button plain class="btn" form-type="submit" data-type="click">
      <slot></slot>
    </button>
  </form>
</template>

<script>
  import wepy from 'wepy'
  export default class Form extends wepy.component {
    methods = {
      formSubmit(e) {
        const formId = e.detail.formId
        this.$emit('wtap', e) // 向父组件传递 wtap 事件
        this.dealFormIds(formId)
      }
    }
    // 处理推送码
    dealFormIds(formId) {
      let formIds = wepy.$instance.globalData.globalFormIds
      if (!formIds) {
        formIds = []
      }
      let data = {
        formId,
        expire: parseInt(+Date.now()) + 604800000 // 计算7天后的过期时间的时间戳
      }
      formIds.push(data)
      wepy.$instance.globalData.globalFormIds = formIds
    }
  }
</script>
