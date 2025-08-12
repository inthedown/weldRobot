<template>
  <view class="step-container">
    <template v-for="(step, index) in steps">
      <view class="step-item" :key="'step-' + index">
        <view class="step-content" @click="handleStepClick(index, step)">
          <uni-icons
            :type="step.icon"
            :color="getColor(index)"
            size="24"
            class="uni-icon"
          />
          <text class="step-text" :style="{ color: getColor(index) }">{{
            step.name
          }}</text>
        </view>
      </view>
      <!-- 仅在不是最后一个时渲染箭头 -->
      <view
        v-if="index < steps.length - 1"
        class="arrow-wrapper"
        :key="'arrow-' + index"
      >
        <uni-icons
          type="arrow-right"
          size="20"
          color="#ccc"
          class="arrow-icon"
        />
      </view>
    </template>
  </view>
</template>

<script>
export default {
  name: "NaviTop",
  components: {},
  props: {
    currentStep: {
      type: Number,
      default: 0,
    },
    weld_class: {},
  },
  computed: {
    localStep: {
      get() {
        return this.currentStep;
      },
      set(val) {
        this.$emit("update:currentStep", val);
      },
    },
    localWeldClass: {
      get() {
        return this.weld_class;
      },
      set(val) {
        this.$emit("update:weld_class", val);
      },
    },
  },
  data() {
    return {
      steps: [
        {
          name: "放置工件",
          icon: "compose",
          active: true,
        },
        {
          name: "选择焊缝类型",
          icon: "checkbox",
          active: false,
        },
        {
          name: "开始识别",
          icon: "image",
          active: false,
        },
      ],
    };
  },
  created() {},
  mounted() {},
  methods: {
    getColor(index) {
      if (index < this.localStep) return "#00f70d"; // 当前或已完成 → 蓝色
      if (index === this.localStep) return "#007AFF";
      if (index === this.localStep + 1) return "#000000"; // 下一步 → 黑色
      return "#999999"; // 其余未到 → 灰色
    },
    handleStepClick(index, step) {
      if (this.localWeldClass === "" && index === 2) {
        uni.showToast({
          title: "未选择焊缝类型",
          icon: "error", // success / none / loading / error (部分平台不支持 error)
          duration: 1500,
        });
        return;
      }
      this.localStep = index;
    },
  },
  watch: {},
};
</script>

<style>
.step-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.step-item {
  flex: 1;
  display: flex;
  justify-content: center;
}

.step-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}

.arrow-wrapper {
  flex: 0;
  /* 或者设置一个最小宽度以保证间距 */
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40rpx;
}
</style>
