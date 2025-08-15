<template>
	<view class="content">
	    <!-- JSON 格式化展示 -->
	    <text class="json-view"> 当前位姿：{{ formattedMessage }}</text>
	
	    <!-- 按钮 -->
		<button class="reset-btn" @click="refresh">刷新位资</button>
	    <button class="reset-btn" @click="reset">设置为初始位姿</button>
	  </view>
</template>

<script>
	export default {
		name: 'About-Index',
		data() {
			return {
				message: 'This is the About Page!'
			};
		},
		computed: {
		    // 格式化 JSON
		    formattedMessage() {
		      return JSON.stringify(this.message, null, 2);
		    }
		  },
		mounted() {
			this.refresh();
		},
		methods: {
			refresh(){
				this.$rest.getRobotPosition().then(res => {
					const { query_message,query_status, ...newObj } = res.data;
					this.message=newObj;
				})
			},
			reset() {
				this.$rest.getRobotPosition().then(res => {
					console.log('获取当前位置',res);
					const data = res.data;
					const position = {
						"rx": data.rx,
						"ry": data.ry,
						"rz": data.rz,
						"x": data.x,
						"y": data.y,
						"z": data.z
					}
					const deviceIp = uni.getStorageSync('device_ip').split(':')[0];
					this.$sql.resetRobotPosition(deviceIp, position).then(() => {
						uni.showToast({
							title:'重置成功',
							 icon: "success", // success / none / loading / error (部分平台不支持 error)
							  duration: 1500
						});
						this.message=JSON.stringify(position);
					}).catch(err => {
						uni.showToast({
							title:'重置失败'+err.message,
							 icon: "error", // success / none / loading / error (部分平台不支持 error)
							duration: 1500
						})
					})

				}).catch(err=>{
					uni.showToast({
						title:'获取机械臂当前位置失败：'+err.message,
						 icon: "error", // success / none / loading / error (部分平台不支持 error)
						duration: 1500
					})
				})
			}
		}

	}
</script>

<style>
.content {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  justify-content: center;
  align-items: center;
  height: 100vh; /* 占满全屏 */
  background-color: #f5f5f5;
  padding: 20rpx;
  box-sizing: border-box;
}

.json-view {
  font-family: monospace;
  font-size: 28rpx;
  white-space: pre-wrap; /* 保留换行缩进 */
  background: #000;
  color: #0f0;
  padding: 20rpx;
  border-radius: 8rpx;
  width: 90%;
  margin-bottom: 30rpx;
}

.reset-btn {
  width: fit-content; /* 按钮宽度 */
  text-align: center;
  background-color: #007aff;
  color: #fff;
  border-radius: 8rpx;
}
</style>