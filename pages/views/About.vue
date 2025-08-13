<template>
	<view>
		{{ message }}
		<button @click="reset">重置初始位姿</button>
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
		mounted() {
			console.log(this.message);
		},
		methods: {
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

</style>