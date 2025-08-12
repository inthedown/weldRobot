<template>
  <view>
    <tip-card title="焊缝设置">
      <view class="content">
        <view class="tip-text">
          <text>长按图标可拖动编辑</text>
        </view>
		<view class="weld-set-box">
		  <!-- <basic-drag v-model="weldList" width="800rpx" itemKey="id" :column="4" itemHeight="90rpx">
            <template #item="{element}">
              <view  class="drag-item" >
				<image class="drag-icon" :src="element.base64" mode="aspectFill" />
				<text >{{ element.name }}</text>
			  </view>
            </template>
        </basic-drag> -->
		<AppList class="app-list" :listData="weldList" @listChange="listChange"></AppList>
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
import props from '../../uni_modules/lime-icon/components/l-icon/props';
export default {
  components: {
    TipCard,
    BasicDrag,
	AppList
  },
  props: {
    data: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      dragIndex: null, // 被拖拽的元素索引
      weldList: [
        {
          id: 1,
          name: "1",
          base64: "https://dummyimage.com/600x400/000/fff",
          x: 0,
          y: 0,
        },
        {
          id: 2,
          name: "2",
          base64: "https://dummyimage.com/600x400/e0b8e0/0011ff",
          x: 80,
          y: 0,
        },
        {
          id: 3,
          name: "3",
          base64: "https://dummyimage.com/600x400/4c54db/0011ff",
          x: 160,
          y: 0,
        },
        {
          id: 4,
          name: "4",
          base64: "https://dummyimage.com/600x400/ed3d3d/0011ff",
          x: 240,
          y: 0,
        },{
          id: 5,
          name: "1",
          base64: "https://dummyimage.com/600x400/000/fff",
          x: 0,
          y: 0,
        },
        {
          id: 6,
          name: "2",
          base64: "https://dummyimage.com/600x400/e0b8e0/0011ff",
          x: 80,
          y: 0,
        },
        {
          id: 7,
          name: "3",
          base64: "https://dummyimage.com/600x400/4c54db/0011ff",
          x: 160,
          y: 0,
        },
        {
          id: 8,
          name: "4",
          base64: "https://dummyimage.com/600x400/ed3d3d/0011ff",
          x: 240,
          y: 0,
        }
      ],
	//   weldList: this.data || [],
	};
  },
  mounted() {},
  methods: {
	listChange(list){
		console.log('listChange', list);
		//返回给父组件
		this.$emit('listChange',list);
	}
  },
};
</script>
<style>
.page {
  padding: 20rpx;
}

.tip-text {
  font-size: 26rpx;
  margin-bottom: 20rpx;
}
.weld-set-box {
  width: 900rpx;
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
.app-list{
	height: 100%;
}
</style>
