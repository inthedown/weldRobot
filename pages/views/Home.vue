<template>
	<view v-if="!allDevicesConnected" class="image-info" @click="negateToConnect">
		<uni-icons type="redo" class="route-icon" size="20" color="#ffffff"></uni-icons> <text>连接设备</text>
	</view>
	<div v-else>
		<div class="camera-view" v-if="currentStep < 4">
			<navi-top class="navi-top" :weld_class="weld_class" @update:weld_class="weld_class = $event"
				:currentStep="currentStep" @update:currentStep="currentStep = $event" v-if="currentStep < 2"></navi-top>
			<message-card type="primary" :message="message[currentStep]" class="message-card"
				v-if="currentStep < 3"></message-card>
			<div class="image">
				<image v-if="cameraImage" :src="`data:image/jpeg;base64,${cameraImage}`" mode="aspectFill"
					alt="Camera Image" class="bg-img" />
				<div v-else class="image-info">暂无图像</div>
				<!-- 中间虚线框 -->
				<div class="dashed-guide-box" v-if="currentStep === 0">
					<!-- 底部文字 -->
					<div class="guide-text">移动工件到虚线框内</div>
				</div>
			</div>
			<weld-choice class="left-bottom" @updateWeldClass="weld_class = $event" v-if="currentStep === 1">
			</weld-choice>
			<operation-sidebar class="right-mid" v-if="currentStep === 3"
				@changeTask="handleChangeTask"></operation-sidebar>
			<view class="left-bottom" v-if="currentStep === 3">
				<weld-param :delight="isParamSet" @handleChange="changeParam"></weld-param>
				<weld-set :data="identityData" @listChange="handleChangeData" @sendImage="handleSendImage"></weld-set>
			</view>
		</div>
		<div v-if="currentStep === 4">
			<welding-message :is_finished="isFinished" :weld_param="weld_param" :weld_list="weldList"></welding-message>
		</div>
	</div>
</template>

<script>
	import deviceStatus from "@/store/deviceStatus";
	import naviTop from "@/components/navi-top/index.vue";
	import MessageCard from "@/components/message-card/index.vue";
	import WeldChoice from "@/components/weld-choice/index.vue";
	import OperationSidebar from "@/components/operation-sidebar/index.vue";
	import WeldParam from "@/components/weld-param/index.vue";
	import WeldSet from "@/components/weld-set/index.vue";
	import WeldingMessage from "@/components/welding-message/index.vue";
import log from "../../utils/log";
	export default {
		name: "Home-Index",
		components: {
			naviTop,
			MessageCard,
			WeldChoice,
			OperationSidebar,
			WeldParam,
			WeldSet,
			WeldingMessage,
		},
		data() {
			return {
				socket: null,
				status: null,
				cameraImage: null,
				currentStep: 0,
				message: [
					"请将工件放置在相机虚线框中",
					"请选择焊缝类型",
					"焊缝识别中...",
				],
				weld_class: "",
				identityData: [],
				currentIndex: 0,
				timer: null,
				socketTask: null,
				startIdentify: false,
				weld_param: {},
				isParamSet: false,
				weldList: [],
				reconnectAttempts: 0, // 定义重连相关变量
				maxReconnectAttempts: 10, // 定义重连相关变量  最大重连次数
				reconnectTimer: null, // 定义重连相关变量
				isFinished:false
			};
		},
		computed: {
			statusText() {
				switch (this.status) {
					case 0:
						return "结束";
					case 1:
						return "进行中";
					case 2:
						return "异常";
					default:
						return "未知";
				}
			},
			statusClass() {
				return {
					running: this.status === 1,
					done: this.status === 0,
					error: this.status === 2,
				};
			},
			allDevicesConnected() {
				return (
					deviceStatus.armStatus === "正常" &&
					deviceStatus.cameraStatus === "正常" &&
					deviceStatus.welderStatus === "正常"
				);
			},
			showMessage() {
				return this.currentStep === 0;
			},
		},
		mounted() {
			if (this.allDevicesConnected) {
				this.$rest
					.startImageWs()
					.then((res) => {
						const data = res.data;
						if (data.initial_image_status) {
							this.connectWebSocket();
						}
					})
					.catch((err) => {});
			}
		},
		created() {},
		watch: {
			currentStep(newVal) {
				console.log("当前阶段：", newVal);
				if (newVal === 2) {
					this.$rest.stopImageWs().then(res=>{
						console.log('res',res);
						const data=res.data;
						if(data.initial_image_status){
							this.startIdentifyTask();
						}else{
							uni.showToast({
								title: "关闭相机数据传输失败",
								icon: "error", // success / none / loading / error (部分平台不支持 error)
								duration: 1500,
							});
							this.currentStep=1;
						}
					})
					.catch(err=>{
						console.log('关闭相机数据传输失败',err.message);
						this.currentStep=1;
					})
					
				} else if (newVal === 3){
					if(this.identityData && this.identityData.length>0){
						this.cameraImage = this.identityData[0].weld_image_base64;
					}
				}else if (newVal === 4) {
					this.initWeldList();
				}
			},
		},
		beforeDestroy() {
			if (this.socket) {
				this.socket.close();
			}
		},
		onUnload() {
			this.stopImageLoop();
		},
		methods: {
			handleInit() {
				this.currentStep = 0;
			},
			negateToConnect(){
				this.$emit('navigateTo','Connect');
			},
			connectWebSocket() {
				const deviceIp = uni.getStorageSync("device_ip");
				console.log(deviceIp);

				if (!deviceIp) {
					console.error("device_ip 不存在");
					return;
				}

				const IP = deviceIp.split(":")[0]; // 从 device_ip 提取 IP
				const wsPort = this.$config.wsProt;
				const wsUrl = "ws://" + IP + ":" + wsPort + "/ws?camera=Cam01";
				console.log("WebSocket URL:", wsUrl);
				// 定义重连相关变量（放在 this 上，保证多次调用共享）
				if (!this.reconnectAttempts) this.reconnectAttempts = 0;
				if (!this.maxReconnectAttempts) this.maxReconnectAttempts = 10; // 最大重连次数
				if (!this.reconnectTimer) this.reconnectTimer = null;
				// 建立连接
				this.socketTask = uni.connectSocket({
					url: wsUrl,
					success: () => {
						console.log("WebSocket 发起连接成功");
					},
					fail: (err) => {
						console.error("WebSocket 连接失败:", err);
						scheduleReconnect();
					},
				});
				const createSocket = () => {
					if (this.socketTask == null) {
						this.socketTask = uni.connectSocket({
							url: wsUrl,
							success: () => {
								console.log("WebSocket 发起连接成功");
							},
							fail: (err) => {
								console.error("WebSocket 连接失败:", err);
								scheduleReconnect();
							},
						});
					}
					// 连接打开
					this.socketTask.onOpen(() => {
						console.log("WebSocket 连接已建立");
						this.reconnectAttempts = 0; // 重连计数清零
						if (this.reconnectTimer) {
							clearTimeout(this.reconnectTimer);
							this.reconnectTimer = null;
						}
					});

					// 接收消息
					this.socketTask.onMessage((res) => {
						try {
							const arrayBuffer = res.data;
							const uint8Array = new Uint8Array(arrayBuffer);

							// 尝试用 TextDecoder 解码
							let text = "";
							if (typeof TextDecoder !== "undefined") {
								const decoder = new TextDecoder("utf-8");
								text = decoder.decode(uint8Array);
							} else {
								// fallback 分块解码
								let CHUNK_SIZE = 0x8000;
								for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
									text += String.fromCharCode.apply(
										null,
										uint8Array.subarray(i, i + CHUNK_SIZE)
									);
								}
							}
							const json = JSON.parse(text);
							const data = json.data || {};

							if (this.currentStep == 0 || this.currentStep == 1) {
								//初始阶段 就展示相机画面
								this.status = data.status;
								this.cameraImage = data.camera_image;
							} else if (this.startIdentify && this.currentStep === 2) {
								//todo 有没有必要加flag
								this.status = data.status;
								if(data.camera_image){
									this.cameraImage = data.camera_image;
								}
								console.log('this.status', this.status);
								if (data.status === 0){
									this.handleWeldIdentifyResult(data);
								}

							} else if (this.currentStep === 4) {
								console.log('收到的焊接进度数据',data);
								if(!('weld_id' in data) && data.status === 0){
									this.isFinished=true;
								}
								console.log(this.weldList);
								this.weldList = this.updateWeldStatus(
									this.weldList,
									data.weld_id,
									data.status
								);
							}
						} catch (e) {
							console.error("解析消息失败:", e);
						}
					});

					// 连接错误
					this.socketTask.onError((err) => {
						console.error("WebSocket 错误:", err);
						scheduleReconnect();
					});

					// 连接关闭
					this.socketTask.onClose(() => {
						console.log("WebSocket 连接关闭");
						this.stopImageLoop();
						scheduleReconnect();
					});
					const scheduleReconnect = () => {
						if (this.reconnectAttempts >= this.maxReconnectAttempts) {
							console.error("WebSocket 达到最大重连次数，停止重连");
							return;
						}
						if (this.reconnectTimer) return; // 避免重复定时器

						const timeout = Math.min(1000 * 2 ** this.reconnectAttempts, 30000); // 指数退避，最大30秒
						console.log(
							`WebSocket ${
              this.reconnectAttempts + 1
            } 次重连，${timeout}ms 后尝试连接`
						);
						this.reconnectTimer = setTimeout(() => {
							this.reconnectAttempts++;
							this.reconnectTimer = null;
							createSocket();
						}, timeout);
					};
				};
				createSocket();
			},
			closeWebSocket() {
				if (this.socketTask) {
					this.socketTask.close({
						success: () => {
							console.log("WebSocket 已关闭");
							this.cameraImage = null;
							this.socketTask = null;
						},
					});
				}
			},
			handleShowChoice() {
				//选择焊缝类型
				this.currentStep = 1;
			},
			startIdentifyTask() {
				console.log("startIdentifyTask");
				//开始识别
				// this.currentStep = 2;
				//1.获取当前机械臂位置
				const deviceIp = uni.getStorageSync("device_ip").split(":")[0];
				this.$sql
					.getRobotPosition(deviceIp)
					.then((res) => {
						console.log("res", res);
						if (res == null) {
							uni.showToast({
								title: "获取当前机械臂位置失败",
								icon: "error", // success / none / loading / error (部分平台不支持 error)
								duration: 1500,
							});
							this.currentStep = 1; //返回识别前一步
						}
						console.log("res.position", res.init_position);
						const position = JSON.parse(res.init_position);
						console.log("position", position);
						const param = this.concatIdentifyParam(position); //拼接参数
						this.$rest
							.stratIdentify(param)
							.then((res) => {
								//调用焊缝识别接口  平焊缝：0，角焊缝：1，圆焊缝：2
								console.log("开始焊缝识别结果", res);
								if (res.data.weld_detection_status) { //todo 不知道为什么 这里没直接返回data中的结果
									//成功开始
									uni.showToast({
										title: "开始识别焊缝",
										icon: "success", // success / none / loading / error (部分平台不支持 error)
										duration: 1500,
									});
									this.startIdentify = true;
								} else {
									uni.showToast({
										title: "识别焊缝启动失败",
										icon: "error", // success / none / loading / error (部分平台不支持 error)
										duration: 1500,
									});
									this.currentStep = 1;
								}
							})
							.catch((err) => {});
					})
					.catch((err) => {
						console.log("获取机械臂位置失败", err);
						uni.showToast({
							title: "获取当前机械臂位置失败",
							icon: "error", // success / none / loading / error (部分平台不支持 error)
							duration: 1500,
						});
						this.currentStep = 1; //返回识别前一步
					});
			},
			concatIdentifyParam(raw) {
				const param = {
					type: "weld_detection",
					weld_type: this.weld_class,
					original_point: {
						tool: "1",
						rx: raw.rx,
						ry: raw.ry,
						rz: raw.rz,
						x: raw.x,
						y: raw.y,
						z: raw.z,
					},
				};
				return {
					channel: "RestChannel",
					node: "weld",
					data: param,
				};
			},
			handleWeldIdentifyResult(data) {
				this.identityData = this.combineWeldData(data);
				// console.log("整理后的结果", this.identityData);
				this.startImageLoop();
			},
			combineWeldData(data) {
				const {
					weld_datas = [], weld_images = []
				} = data;
				const imageMap = {};
	
				// 构造 weld_id => image 对应表
				weld_images.forEach((img) => {
					Object.keys(img).forEach((key) => {

						if (key !== "timestamp") {
							imageMap[key] = {
								weld_image_base64: img[key],
								timestamp: img.timestamp,
							};
						}
					});
				});
				// 整合数组
				const result = weld_datas.map((item) => {
					const imageData = imageMap[item.weld_id] || {};
					return {
						appId: item.weld_id,
						name: `焊缝 ${item.weld_id}`,
						weld_id: item.weld_id,
						weld_length: item.weld_length,
						weld_positions: item.weld_positions,
						weld_image_base64: imageData.weld_image_base64 || "",
						timestamp: imageData.timestamp || null,
					};
				});

				return result;
			},
			startImageLoop() {
				this.currentIndex = 0;
				if (this.timer) clearInterval(this.timer); // 若已有定时器先清除
				this.timer = setInterval(() => {
					if (this.status === 0) {
						//status：状态值0结束，1进行中，2异常
						// 状态为0，结束循环
						clearInterval(this.timer);
						this.timer = null;
						// todo 要不要关闭 WebSocket 连接
						this.closeWebSocket();
						this.currentStep = 3;
						return;
					}

					if (!this.identityData.length) return;

					const current = this.identityData[this.currentIndex];
					if(current.weld_image_base64){
						console.log('更新画面索引',this.currentIndex);
						this.cameraImage = current.weld_image_base64;
						this.currentIndex = (this.currentIndex + 1) % this.identityData.length;
					}
					
				}, 3000); // 每 3 秒切换一张图
			},
			stopImageLoop() {
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
			},
			handleChangeData(data) {
				this.identityData = data;
				console.log("handleChangeData", this.identityData);
			},
			changeParam(param) {
				this.weld_param = param;
				if (param && Object.keys(param).length > 0) {
					this.isParamSet = true;
				} else {
					this.isParamSet = false;
				}
				console.log("changeParam", this.weld_param);
			},
			handleChangeTask(task) {
				console.log(task);
				switch (task) {
					case "识别":
						this.handleStartIdentify();
						break;
					case "模拟运行":
						this.simulateRun();
						break;
					case "开始焊接":
						this.startTask(false);
						break;
					case "重置机械臂":
						this.resetRobot();
						break;
				}
			},
			handleStartIdentify() {
				//返回到设置焊缝类型阶段
				this.currentStep = 1;
				this.resetLocalData();
			},
			resetLocalData() {
				//重置本地数据
				this.cameraImage = null;
				//   this.currentStep = 0;
				this.status = null;
				this.identityData = [];
				this.startIdentify = false;
				this.weld_class = "";
				this.weld_param = {};
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
			},
			simulateRun() {
				//模拟运行
				this.startTask(true);
			},
			startTask(simulateFlag) {
				//开始焊接
				if (this.identityData.length === 0) {
					uni.showToast({
						title: "当前未识别到焊缝",
						icon: "none",
					});
					return;
				}
				if (!this.weld_param || Object.keys(this.weld_param).length === 0) {
					uni.showToast({
						title: "请先设置焊接参数",
						icon: "none",
					});
					return;
				}
				const deviceIp = uni.getStorageSync("device_ip").split(":")[0];
				this.$sql
					.getRobotPosition(deviceIp)
					.then((res) => {
						if (res == null) {
							uni.showToast({
								title: "获取当前机械臂位置失败",
								icon: "error", // success / none / loading / error (部分平台不支持 error)
								duration: 1500,
							});
						}
						const position =JSON.parse(res.init_position);  
						console.log('position', position);
						const data = this.concatWeldingParam(simulateFlag);
						this.$rest
							.startTask( position, data)
							.then((res) => {
								console.log("开始焊接结果", res);
								if (res.data &&res.data.weld_start_status) {
									const titleStr = simulateFlag ?
										"模拟焊接任务已开始" :
										"焊接任务已开始";
									uni.showToast({
										title: titleStr,
										icon: "success",
									});
									if (!simulateFlag) this.currentStep = 4; // 切换到焊接界面
								} else {
									const titleStr = simulateFlag ?
										"模拟焊接任务启动失败" :
										"焊接任务启动失败";
									uni.showToast({
										title: titleStr,
										icon: "error",
									});
								}
							})
							.catch((err) => {});
					})
					.catch((err) => {});
			},
			//构造请求数据
			concatWeldingParam(simulateFlag) {
				const result = this.identityData.map((item) => ({
					weld_id: item.weld_id,
					weld_length: item.weld_length,
					weld_positions: item.weld_positions,
					simulate: simulateFlag,
					welding_current: this.weld_param.electric,
					welding_correction_voltage: this.weld_param.voltage,
					welding_swing: this.weld_param.amplitude,
					welding_speed: this.weld_param.speed,
				}));
				return result;
			},
			resetRobot() {
				//重置机械臂
				this.$sql.getRobotPosition().then((res) => {
					const position = {
						rx: 0,
						ry: 0,
						rz: 0,
						x: 0,
						y: 0,
						z: 0,
					};
					if (res && res != null) {
						position = res;
					}
					console.log("重置机械臂位置", position);
					const param = {
						tool: "1",
						rx: position.rx,
						ry: position.ry,
						rz: position.rz,
						x: position.x,
						y: position.y,
						z: position.z,
					};
					this.$rest
						.resetRobot(param)
						.then((res) => {
							console.log("重置机械臂结果", res);
							if (res.success) {
								uni.showToast({
									title: "机械臂已重置",
									icon: "success",
								});
								this.resetLocalData();
							} else {
								uni.showToast({
									title: "重置机械臂失败",
									icon: "error",
								});
							}
						})
						.catch((err) => {});
				});
			},
			updateWeldStatus(welds, weld_id, status) {
				return welds.map((weld) => {
					if (weld.id === weld_id) {
						let statStr = "waiting"; // 默认
						if (status === 0) statStr = "done";
						else if (status === 1) statStr = "in_progress";
						else if (status === 2) statStr = "error";
						return {
							...weld,
							status: statStr,
						};
					} else {
						// 其他保持原状态，不改动
						return weld;
					}
				});
			},
			initWeldList() {
				// 初始化焊接列表
				this.weldList = this.identityData.map((item) => ({
					id: item.weld_id,
					name: `焊缝 ${item.weld_id}`,
					status: "waiting", // 初始状态为等待
				}));
			},
			handleSendImage(base64){
				this.cameraImage=base64;
			}
		},
	};
</script>

<style scoped>
	.camera-view {
		position: relative;
		width: 100%;
		height: 100vh;
		/* 或者你需要的高度 */
		overflow: hidden;
	}

	.image-info {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		font-size: 18px;
		z-index: 1;
		white-space: nowrap;
	}

	.message-card {
		width: 80%;
		height: 55rpx;
		margin: 0 auto;
		margin-top: 12px;
	}

	.navi-top {
		width: 80%;
		height: 70rpx;
		margin: 0 auto;
		background-color: #ffffff;
		border-bottom: 1px solid #eee;
	}

	.image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		z-index: 0;
	}

	.background-img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		z-index: 0;
	}

	.no-image {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: white;
		z-index: 1;
	}

	.navi-top,
	.message-card,
	.status {
		position: relative;
		z-index: 2;
		/* 确保在图像之上 */
	}

	.bg-img {
		width: 100%;
		height: 100vh;
		display: block;
	}

	/* 中间虚线框 */
	.dashed-guide-box {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 400px;
		/* 修改成你想要的虚线框宽度 */
		height: 400px;
		/* 修改成你想要的虚线框高度 */
		transform: translate(-50%, -50%);
		border: 4px dashed #ffdd01;
		/* 白色虚线边框 */
		border-radius: 10px;
		box-sizing: border-box;
		z-index: 2;
		/* 确保在图像上方 */
		pointer-events: none;
		/* 不干扰鼠标点击 */
	}

	/* 底部文字 */
	.guide-text {
		position: absolute;
		bottom: 10px;
		left: 50%;
		transform: translateX(-50%);
		color: #ffdd01;
		font-size: 14px;
		white-space: nowrap;
		user-select: none;
		pointer-events: none;
	}

	.left-bottom {
		position: fixed;
		/* 或 absolute，取决于是否有滚动容器 */
		bottom: 0;
		border-radius: 12rpx;
		z-index: 1000;
	}
	.route-icon{
		height: 100rpx;
		width: 100rpx;
		color: #ffffff;
	}
</style>