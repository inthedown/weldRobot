<template>
	<!-- <view class="overlay" @tap="handleBackgroundClick"> -->
	<view class="card">
		<view class="card-title">{{ title }}</view>
		<view class="card-content">
			<slot></slot> <!-- 插槽内容 -->
		</view>
	</view>
	<!-- </view> -->
</template>

<script>
	export default {
		name: 'TipCard',
		props: {
			title: {
				type: String,
				default: '提示',
			},
			closeOnBackground: {
				type: Boolean,
				default: true,
			}
		},
		methods: {
			handleBackgroundClick() {
				if (this.closeOnBackground) {
					this.$emit('close');
				}
			}
		}
	};
</script>

<style scoped>
	.card {
		min-height: 200rpx;
		height: fit-content;
		min-width: 400rpx;
		border-radius: 16rpx;
		overflow: hidden;
		padding: 20rpx;
		background-color: #fbfeffb3;
		display: flex;
		flex-direction: column;
		margin-top: 40rpx;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: bold;
		color: black;
		flex-shrink: 0;
	}

	.card-content {
		margin-top: 24rpx;
		padding: 24rpx;
		height: 100%;
		flex: 1;
		box-sizing: border-box;
		background-color: #ffffff;
		border-radius: 16rpx;
		 display: flex;
		align-items: center;
		/* 垂直居中 */
		justify-content: center;
		/* 水平居中 */
	}
</style>