<template>
	<view>
		<tip-card title="焊缝设置">
			<view class="content">
				<view class="tip-text">
					<text>长按图标可拖动编辑</text>
				</view>

				<!-- 图标列表 -->
				<!-- <movable-area class="weld-set-box">
					<movable-view class="weld-set-item" v-for="(item, index) in weldList" :key="item.id" draggable="true"
						@dragstart="dragStart(index)" @dragover.prevent @drop="dropItem(index)">
						<view class="item-icon">
							<image :src="item.base64" class="drag-icon" mode="aspectFill" />
						</view>
						<view class="item-text">{{ item.name }}</view>
					</movable-view>
				</movable-area> -->
				<!-- <movable-area class="weld-set-box" :scale-area="true">
					<movable-view v-for="(item, index) in weldList" :key="item.id" class="weld-set-item"
						:direction="'all'" :inertia="true" :x="item.x" :y="item.y" @change="onDragChange($event, index)"
						@touchstart="onTouchStart($event, index)">
						<view class="item-icon">
							<image :src="item.base64" class="drag-icon" mode="widthFix" />
						</view>
						<view class="item-text">{{ item.name }}</view>
					</movable-view>
				</movable-area> -->
				 <basic-drag   class="weld-set-box" v-model="weldList" itemKey="id" :column="1" itemHeight="40rpx">
				            <template #item="{item}">
								<view class="weld-set-item">
									<view class="item-icon">
										<image :src="item.base64" class="drag-icon" mode="widthFix" />
									</view>
									<view class="item-text">{{ item.name }}</view> 
								</view>
				                      
				            <!-- <view class="drag-item">{{ element.title }}</view> -->
				            </template>
				        </basic-drag>
				<!-- 垃圾桶 -->
				<view class="trash-bin" @dragover.prevent @drop="dropToTrash">
					<uni-icons type="trash-filled" color="#ff4d4f" size="40"></uni-icons>
				</view>
			</view>

		</tip-card>
	</view>
</template>

<script>
	import TipCard from '@/components/tip-card/index.vue'
import BasicDrag from '@/components/basic-drag/index.vue';

	export default {
		components: {
			TipCard,BasicDrag
		},
		data() {
			return {
				dragIndex: null, // 被拖拽的元素索引
				weldList: [{
						id: 1,
						name: "1",
						base64: "https://dummyimage.com/600x400/000/fff",
						x: 0,
						y: 0
					},
					{
						id: 2,
						name: "2",
						base64: "https://dummyimage.com/600x400/e0b8e0/0011ff",
						x: 80,
						y: 0
					},
					{
						id: 3,
						name: "3",
						base64: "https://dummyimage.com/600x400/4c54db/0011ff",
						x: 160,
						y: 0
					},
					{
						id: 4,
						name: "4",
						base64: "https://dummyimage.com/600x400/ed3d3d/0011ff",
						x: 240,
						y: 0
					}
				]
			}
		},
		methods: {
			dragStart(index) {
				this.dragIndex = index;
			},
			dropItem(index) {
				if (this.dragIndex === null) return;
				const movedItem = this.weldList.splice(this.dragIndex, 1)[0];
				this.weldList.splice(index, 0, movedItem);
				this.dragIndex = null;
			},
			dropToTrash() {
				if (this.dragIndex === null) return;
				this.weldList.splice(this.dragIndex, 1);
				this.dragIndex = null;
			},
			onTouchStart(e, index) {
				// 可根据需要处理长按事件
			},
			onDragChange(e, index) {
				const {
					x,
					y
				} = e.detail;
				this.$set(this.weldList[index], 'x', x);
				this.$set(this.weldList[index], 'y', y);
			}
		}
	}
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
	  width: 100%;
	  height: 150px;
	  background: #f5f5f5;
	  position: relative;
	}
	.weld-set-item {
	  width: 60px;
	  height: 90px;
	  position: absolute;
	  user-select: none;
	  /* 其他样式 */
	}
	.drag-icon {
	  width: 60px;
	  height: 60px;
	  background: #eee;
	}
	.item-text {
	  text-align: center;
	  font-size: 14px;
	  margin-top: 5px;
	}
	.trash-bin {
	  margin-top: 20px;
	  padding: 20px;
	  border: 2px dashed #ff4d4f;
	  text-align: center;
	  border-radius: 8px;
	}
</style>