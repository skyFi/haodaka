<style lang="less">
.weui-toptips {
  position: fixed;
  transform: translateZ(0) translateY(-100%);
  top: 0;
  left: 0;
  right: 0;
  padding: 5px;
  font-size: 14px;
  text-align: center;
  color: #FFFFFF;
  z-index: 5000;
  word-wrap: break-word;
  word-break: break-all;
}

.weui-toptips_warn {
  background-color: #E64340;
}

.weui-toptips_success {
  background-color: #1AAD19;
}
</style>

<template>
  <view wx:if="{{show}}" animation="{{animationData}}" class="weui-toptips weui-toptips_{{type === 'error' ? 'warn' : 'success'}}">
    {{text}}
  </view>
</template>
<script>
  import wepy from 'wepy';
  export default class Toptip extends wepy.component {
    data = {
      type: 'error',
      duration: 2000,
      animateDuration: 300,
      animationData: '',
      text: '',
      show: false
    };
    methods = {
      /**
       * @param data: type, duration, text(required)
       */
      show(data = {}) {
        // show
        Object.assign(this, data, {
          show: true
        });
        this.$apply();
        // slide down toptip
        let animation = wepy.createAnimation({
          duration: this.animateDuration,
          timingFunction: 'ease-in'
        });
        animation.translateY(0).step();
        this.animationData = animation.export();
        this.$apply();
        // duration 之后消失
        setTimeout(() => {
          this.hide();
        }, this.duration);
      }
    };
    hide() {
      let animation = wepy.createAnimation({
        duration: this.animateDuration,
        timingFunction: 'ease-out'
      });
      animation.translateY('-100%').step();
      this.animationData = animation.export();
      this.$apply();
      // animate end, remove element
      setTimeout(() => {
        this.show = false;
        this.$apply();
      }, this.animateDuration + 50);
    }
  }
</script>
