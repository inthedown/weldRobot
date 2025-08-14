<template>
  <view>
    <tip-card title="焊缝设置">
      <view class="content">
        <view class="tip-text">
          <text>长按图标可拖动编辑</text>
        </view>
        <view class="weld-set-box">
          <AppList
            class="app-list"
            :listData="weldList"
            @listChange="listChange"
			@showImage="handleShowImage"
          ></AppList>
        </view>
        <!-- <view ref="trash" class="trash-bin">
          <uni-icons type="trash-filled" color="#ff4d4f" size="40" />
          <text>拖到这里删除</text>
        </view> -->
      </view>
    </tip-card>
  </view>
</template>

<script>
import TipCard from "@/components/tip-card/index.vue";
import BasicDrag from "@/components/basic-drag/index.vue";
import AppList from "@/components/healer-dragList/AppList.vue";
export default {
  components: {
    TipCard,
    BasicDrag,
    AppList,
  },
  props: {
    data: {
      type: Array,
      default:()=>[],
    },
  },
  data() {
    return {
      dragIndex: null, // 被拖拽的元素索引
      weldList: this.data,
    };
  },
  mounted() {},
  watch: {
    data(newVal) {
      this.weldList = newVal;
      console.log("Updated weldList:", this.weldList);
    },
  },
  methods: {
    listChange(list) {
      console.log("listChange", list);
      //返回给父组件
      this.$emit("listChange", list);
    },
	handleShowImage(base64){
		this.$emit('sendImage',base64);
	}
  },
};
</script>
<style scoped>
.page {
  padding: 20rpx;
}

.content{
	width: 100%;
}
.tip-text {
  font-size: 26rpx;
  margin-bottom: 20rpx;
}
.weld-set-box {
  width: 600rpx;
  height: fit-content;
}
.weld-set-item {
  /* width: 80px;
  height: 100px;
  position: absolute;
  user-select: none;
  text-align: center; */
}
.drag-icon {
  width: 60rpx;
  height: 60rpx;
  margin: 0 auto;
  display: block;
  background: #eee;
}
.item-text {
  margin-top: 5px;
  font-size: 14px;
}
.trash-bin {
  width: 100px;
  height: 80px;
  border: 2px dashed #ff4d4f;
  border-radius: 8px;
  text-align: center;
  line-height: 40px;
  color: #ff4d4f;
  margin: 0 auto;
}
.tip-text {
  padding: 10px;
  font-size: 14px;
  color: #666;
}
.app-list {
  height: 100%;
}
</style>
