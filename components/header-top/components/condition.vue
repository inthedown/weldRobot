<template>
	<view class="condition">
		<view class="condition-item">
			<image src="@/static/arm.svg" mode="aspectFit" style="width: 40rpx; height: 40rpx; margin-right: 10rpx;" />
			<span :class="armClass">机械臂{{ armStatus }}</span>
		</view>
		<view class="condition-item">
			<image src="@/static/camera.svg" mode="aspectFit" style="width: 40rpx; height: 40rpx; margin-right: 10rpx;" />
			<span :class="cameraClass">相机{{ cameraStatus }}</span>
		</view>
		<view class="condition-item">
			<image src="@/static/weld.svg" mode="aspectFit" style="width: 40rpx; height: 40rpx; margin-right: 10rpx;" />
			<span :class="welderClass">焊机{{ welderStatus }}</span>
		</view>
	</view>
</template>

<script>
	import deviceStatus from 'store/deviceStatus';
	import {
		EventBus
	} from '@/plugin/event-bus';
	export default {
		name: 'Condition-Index',
		components: {},
		props: {},
		data() {
			return {

			};
		},
		computed: {
			armStatus() {
				return deviceStatus.armStatus;
			},
			cameraStatus() {
				return deviceStatus.cameraStatus;
			},
			welderStatus() {
				return deviceStatus.welderStatus;
			},
			armClass() {
				return this.armStatus === '正常' ? 'status-ok' : 'status-error';
			},
			cameraClass() {
				return this.cameraStatus === '正常' ? 'status-ok' : 'status-error';
			},
			welderClass() {
				return this.welderStatus === '正常' ? 'status-ok' : 'status-error';
			},
			allDevicesConnected() {
				return (
					this.armStatus === '正常' &&
					this.cameraStatus === '正常' &&
					this.welderStatus === '正常'
				);
			}
		},
		mounted() {
			EventBus.$on('device-ip-updated', (newIp) => {
				this.deviceIp = newIp;
				this.showFlag = true;
			});
		},
		methods: {},
		watch: {
			allDevicesConnected(newVal) {
				if (newVal) {
					console.log('所有设备已连接，可以开始业务逻辑了');
					// 这里写你想做的，比如改变导航状态、显示toast、或者发事件通知其他组件
				}
			}
		}
	}
</script>

<style>
	.condition {
		display: flex;
		/* 容器内一行排列 */
		gap: 10px;
		/* 项之间的间距，可根据需要调整 */
	}

	.icon {
		width: 30px;
		height: 30px;
		color: #000000;
		/* 图标大小 */
		fill: currentColor;
		/* 使用当前文本颜色 */
		margin-right: 6px;
		/* 图标与文字间距 */
		vertical-align: middle;
		stroke-width: 7;

	}

	.condition-item {
		display: flex;
		/* 图标和文字横向排列 */
		align-items: center;
		/* 垂直居中 */
		gap: 6px;
		/* 图标与文字间距 */
		padding: 3px 5px;
	}

	.condition-item span {
		white-space: nowrap;
		font-weight: bold;
	}

	.status-ok {
		color: #000;
		font-size: 24rpx;
	}

	.status-error {
		color: #D1272A;
		font-size: 24rpx;
	}
</style>