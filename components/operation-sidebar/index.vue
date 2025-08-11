<template>
	<view class="operation-panel">
		<view class="panel-item" v-for="(item, index) in actions" :key="index" @click="handleClick(item)">
			<!-- 判断是否为模拟运行 -->
			<!-- <uni-icons
			        :type="item.icon"
			        size="26"
			        color="#fff"
			      /> -->
			<l-icon :name="item.icon" color="#fff" size="50rpx" />
			<text class="panel-label">{{ item.label }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				actions: [{
						label: '识别',
						icon: 'material-symbols:android-camera-outline'
					},
					{
						label: '模拟运行',
						icon: 'solar:route-bold'
					},
					{
						label: '开始焊接',
						icon: 'mdi:fire'
					},
					{
						label: '重置机械臂',
						icon: 'ri:reset-right-line'
					}
				]
			}
		},
		methods: {
			handleClick(item) {


			}
		}
	}
</script>

<style>
	.operation-panel {
		position: fixed;
		z-index: 999;
		background: rgba(0, 0, 0, 0.6);
		border-radius: 20rpx;
		padding: 20rpx 10rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		top: 50%;
		right: 10rpx;
		transform: translateY(-50%);
	}

	.panel-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.panel-label {
		font-size: 22rpx;
		color: #fff;
		margin-top: 8rpx;
	}

	.panel-svg {
		width: 40rpx;
		height: 40rpx;
		color: #fff;
	}
</style>