<template>
	<view>
		<message-card :type="getType" :message="message" class="message-card" />
		<view class="message">
			<view class="weld-progress-list">
				<view v-for="task in weld_list" :key="task.id" :class="[
            'weld-task',
            task.status,
            { 'current-task': task.status === 'in_progress' },
          ]">
					<text class="task-name">{{ task.name }}</text>

					<template v-if="task.status === 'done'">
						<uni-icons type="checkbox" color="#00f70d" size="20" />
						<text class="task-text done-text">已完成</text>
					</template>

					<template v-else-if="task.status === 'in_progress'">
						<text class="task-text in-progress-text">焊接中 ...</text>
					</template>

					<template v-else-if="task.status === 'waiting'">
						<text class="task-text waiting-text">等待焊接 ...</text>
					</template>

					<template v-else-if="task.status === 'error'">
						<text class="task-text error-text">异常</text>
					</template>
				</view>
			</view>
			<view class="left-box">
				<div>
					<div class="row title">
						<div>工艺包参数</div>
					</div>
					<div class="row">
						<div>工艺包名称</div>
						<div>{{ weldParam.name }}</div>
					</div>
					<div class="row">
						<div>焊枪摆幅(mm)</div>
						<div>{{ weldParam.amplitude }}</div>
					</div>
					<div class="row">
						<div>焊机电流(A)</div>
						<div>{{ weldParam.electric }}</div>
					</div>
					<div class="row">
						<div>焊枪行进速度(mm/s)</div>
						<div>{{ weldParam.speed }}</div>
					</div>
					<div class="row">
						<div>焊机弧长校正电压(V)</div>
						<div>{{ weldParam.voltage }}</div>
					</div>

					<!-- 其他4行同理 -->
				</div>
			</view>
		</view>
	</view>
</template>
<script>
	import MessageCard from "@/components/message-card/index.vue";
	export default {
		name: "WeldingMessage",
		components: {
			MessageCard,
		},
		props: {
			weld_param: {
				type: Object,
				default: () => ({}),
			},
			weld_list: {
				type: Array,
				default: () => [],
			},
			is_finished: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				// weldTasks: this.weld_list,
				weldParam: this.weld_param
			};
		},
		watch:{
			
		},
		computed: {
			message() {
				console.log(this.is_finished);
				if(this.is_finished){
					return `焊接作业完成`
				}
				return `正在焊接作业中...\n当前焊接 ${this.currentName}`;
			},
			currentName() {
				const task = this.weld_list.find((item) => item.status === "in_progress");
				return task ? task.name : "无正在焊接任务";
			},
			getType(){
				if(this.is_finished){
					return 'success';
				}else{
					return 'primary';
				}
			}
		},
		methods: {
			updateMessage(newMessage) {
				this.message = newMessage;
			},
		},
	};
</script>
<style scoped>
	.message-card {
		width: 80%;
		margin: 0 auto;
		margin-top: 12px;
	}

	.message {
		width: 80%;
		margin: 0 auto;
		margin-top: 12px;
		display: flex;
		justify-content: space-between;
	}

	.weld-progress-list {
		font-family: monospace, "Courier New", monospace;
		background-color: #000;
		color: #ccc;
		padding: 20rpx;
		width: 60%;
	}

	.weld-task {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
		height: 50rpx;
		/* line-height: 1.2; */
	}

	.task-name {
		width: 160rpx;
		color: #ccc;
		margin-right: 200rpx;
	}

	.task-text {
		width: 300rpx;
	}

	.weld-task.done .task-text {
		color: #00f70d;
	}

	.weld-task.in_progress .task-text {
		color: #1e90ff;
		font-weight: bold;
	}

	.weld-task.waiting .task-text {
		color: #999;
	}

	.weld-task.error .task-text {
		color: #ff4d4f;
		font-weight: bold;
	}

	.current-task .task-name {
		color: #1e90ff;
		font-weight: bold;
	}

	.left-box {
		width: 300rpx;
		height: 500rpx;
		flex: 1;
	}

	.title {
		font-weight: bold;
	}

	.row {
		display: flex;
		padding: 8px 0;
	}

	.row>div {
		flex: 1;
	}
</style>