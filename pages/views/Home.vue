<template>
	<div v-if="!allDevicesConnected" class="image-info">
		连接设备
	</div>
	<div v-else>
		<div class="camera-view">
			<navi-top class="navi-top" :weld_class="weld_class" @update:weld_class="weld_class= $event"
				:currentStep="currentStep" @update:currentStep="currentStep = $event" v-if="currentStep<2"></navi-top>
			<message-card type="primary" :message="message[currentStep]" class="message-card" v-if="currentStep<3"></message-card>
			<div class="image">
				<image v-if="cameraImage" :src="`data:image/jpeg;base64,${cameraImage}`" mode="aspectFill"
					alt="Camera Image" class="bg-img" />
				<div v-else class="image-info">暂无图像</div>
				<!-- 中间虚线框 -->
				<div class="dashed-guide-box" v-if="currentStep===0">
					<!-- 底部文字 -->
					<div class="guide-text">移动工件到虚线框内</div>
				</div>
			</div>
			<weld-choice class="left-bottom" @updateWeldClass="weld_class=$event" v-if="currentStep===1">
			</weld-choice>
			<operation-sidebar class="right-mid" v-if="currentStep===3" ></operation-sidebar>
			<view class="left-bottom" v-if="currentStep===3">
					<weld-param ></weld-param>
					<weld-set></weld-set>
			</view>
		
			
		</div>

	</div>
</template>

<script>
	import deviceStatus from '@/store/deviceStatus';
	import naviTop from "@/components/navi-top/index.vue";
	import MessageCard from "@/components/message-card/index.vue";
	import WeldChoice from '@/components/weld-choice/index.vue';
	import OperationSidebar from '@/components/operation-sidebar/index.vue'
	import WeldParam from '@/components/weld-param/index.vue'
	import WeldSet from '@/components/weld-set/index.vue'
	export default {
		name: "Home-Index",
		components: {
			naviTop,
			MessageCard,
			WeldChoice,
			OperationSidebar,
			WeldParam,
			WeldSet
		},
		data() {
			return {
				socket: null,
				status: null,
				cameraImage: null,
				currentStep: 3,
				message: [
					'请将工件放置在相机虚线框中',
					'请选择焊缝类型',
					'焊缝识别中...'
				],
				weld_class: '',
				identityData: [],
				currentIndex: 0,
				timer: null,
				socketTask: null,
				startIdentify: false
			};
		},
		computed: {
			statusText() {
				switch (this.status) {
					case 0:
						return '结束'
					case 1:
						return '进行中'
					case 2:
						return '异常'
					default:
						return '未知'
				}
			},
			statusClass() {
				return {
					running: this.status === 1,
					done: this.status === 0,
					error: this.status === 2
				}
			},
			allDevicesConnected() {
				return deviceStatus.armStatus === '正常' && deviceStatus.cameraStatus === '正常' && deviceStatus
					.welderStatus === '正常';
			},
			showMessage() {
				return this.currentStep === 0
			}
		},
		mounted() {
			if (this.allDevicesConnected) {
				this.$rest.startImageWs().then(res => {
					const data = res.data
					if (data.initial_image_status) {
						this.connectWebSocket();
					}
				}).catch(err => {

				})


			}
		},
		created() {

		},
		watch: {
			currentStep(newVal) {
				if (newVal === 2) {
					this.handleStartIdentify();
				}
			}
		},
		beforeDestroy() {
			if (this.socket) {
				this.socket.close()
			}
		},
		onUnload() {
			this.stopImageLoop();
		},
		methods: {
			handleInit() {
				this.currentStep = 0;
			},
			connectWebSocket() {
				const deviceIp = uni.getStorageSync('device_ip');
				console.log(deviceIp);

				if (!deviceIp) {
					console.error('device_ip 不存在');
					return;
				}

				const IP = deviceIp.split(":")[0]; // 从 device_ip 提取 IP
				const wsPort = this.$config.wsProt
				const wsUrl = 'ws://' + IP + ':' + wsPort + '/ws?camera=Cam01';
				console.log('WebSocket URL:', wsUrl);

				// 建立连接
				this.socketTask = uni.connectSocket({
					url: wsUrl,
					success: () => {
						console.log('WebSocket 发起连接成功');
					},
					fail: (err) => {
						console.error('WebSocket 连接失败:', err);
					}
				});

				// 连接打开
				this.socketTask.onOpen(() => {
					console.log('WebSocket 连接已建立');
				});

				// 接收消息
				this.socketTask.onMessage((res) => {
					try {
						const arrayBuffer = res.data;
						const uint8Array = new Uint8Array(arrayBuffer);

						// 尝试用 TextDecoder 解码
						let text = '';
						if (typeof TextDecoder !== 'undefined') {
							const decoder = new TextDecoder('utf-8');
							text = decoder.decode(uint8Array);
						} else {
							// fallback 分块解码
							let CHUNK_SIZE = 0x8000;
							for (let i = 0; i < uint8Array.length; i += CHUNK_SIZE) {
								text += String.fromCharCode.apply(null, uint8Array.subarray(i, i + CHUNK_SIZE));
							}
						}
						const json = JSON.parse(text);
						const data = json.data || {};

						if (this.currentStep !== 2) { //初始阶段 就展示相机画面
							this.status = data.status;
							this.cameraImage = data.camera_image;
						} else if (this.startIdentify && this.currentStep === 2) { //todo 有没有必要加flag
							this.handleWeldIdentifyResult(data);
						}

					} catch (e) {
						console.error('解析消息失败:', e);
					}
				});

				// 连接错误
				this.socketTask.onError((err) => {
					console.error('WebSocket 错误:', err);
				});

				// 连接关闭
				this.socketTask.onClose(() => {
					console.log('WebSocket 连接关闭');
				});
			},
			closeWebSocket() {
				if (this.socketTask) {
					this.socketTask.close({
						success: () => {
							console.log('WebSocket 已关闭');
							this.cameraImage = null;
							this.socketTask = null;
						}
					});
				}
			},
			handleShowChoice() { //选择焊缝类型
				this.currentStep = 1;
			},
			handleStartIdentify() { //开始识别
				// this.currentStep = 2;
				//1.获取当前机械臂位置
				this.$rest.getRobotPosition().then(res => {
					const position = res.data;
					console.log('position', position);
					const param = this.concatIdentifyParam(position); //拼接参数
					this.$rest.stratIdentify(param).then(res => {//调用焊缝识别接口  平焊缝：0，角焊缝：1，圆焊缝：2
						console.log('开始焊缝识别结果', res);
						if (res.weld_detection_status) {
							//成功开始
							uni.showToast({
								title: '开始识别焊缝',
								icon: 'success', // success / none / loading / error (部分平台不支持 error)
								duration: 1500
							});
							this.startIdentify = true;
						} else {
							uni.showToast({
								title: '识别焊缝启动失败',
								icon: 'error', // success / none / loading / error (部分平台不支持 error)
								duration: 1500
							});
							this.currentStep = 1;
						}
					}).catch(err => {

					})
				}).catch(err => {

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
						z: raw.z
					}
				};
				return {
					channel: "RestChannel",
					node: "weld",
					data: param
				}
			},
			handleWeldIdentifyResult(data) {
				this.status = data.status;
				this.identityData = this.combineWeldData(data);
				console.log('整理后的结果', this.identityData);
				this.startImageLoop();

			},
			combineWeldData(data) {
				const {
					weld_datas = [], weld_images = []
				} = data;
				const imageMap = {};

				// 构造 weld_id => image 对应表
				weld_images.forEach(img => {
					Object.keys(img).forEach(key => {
						if (key !== 'timestamp') {
							imageMap[key] = {
								weld_image_base64: img[key],
								timestamp: img.timestamp
							};
						}
					});
				});

				// 整合数组
				const result = weld_datas.map(item => {
					const imageData = imageMap[item.weld_image] || {};
					return {
						weld_id: item.weld_id,
						weld_length: item.weld_length,
						weld_positions: item.weld_position,
						weld_image_base64: imageData.weld_image_base64 || '',
						timestamp: imageData.timestamp || null
					};
				});

				return result;
			},
			startImageLoop() {
				this.currentIndex = 0;
				if (this.timer) clearInterval(this.timer); // 若已有定时器先清除
				this.timer = setInterval(() => {
					if (this.status === 0) { //status：状态值0结束，1进行中，2异常
						// 状态为0，结束循环
						clearInterval(this.timer);
						this.timer = null;
						// 关闭 WebSocket 连接，假设存在 this.ws
						this.closeWebSocket();
						this.currentStep=3;
						return;
					}

					if (!this.identityData.length) return;

					const current = this.identityData[this.currentIndex];
					this.cameraImage = current.weld_image_base64;
					this.currentIndex = (this.currentIndex + 1) % this.identityData.length;
				}, 3000); // 每 3 秒切换一张图
			},
			stopImageLoop() {
				if (this.timer) {
					clearInterval(this.timer);
					this.timer = null;
				}
			}
		}
	}
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
	
	
</style>