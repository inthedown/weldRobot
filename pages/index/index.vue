<template>
	<view id="app">
		<view :style="{ height: statusBarHeight + 'px' }"></view>
		<header-top class="header"></header-top>
		<view class="main">
			<view class="sidebar">
				<view class="sidebar">
					<view v-for="item in menuList" :key="item.path" class="menu-item"
						:class="{ active: isActive(item.path) }" @click="navigate(item.path)">
						<uni-icons class="menu-icon" :type="item.icon" :color="isActive(item.path) ? '#f00' : '#000'"
							size="30"></uni-icons>
						<text class="menu-text">{{ item.name }}</text>
					</view>
				</view>
			</view>
			<view :class="bgClass" class="content">
				<Connect v-if="currentView === 'Connect'"></Connect>
				<Home v-if="currentView === 'Home'"></Home>
				<About v-if="currentView === 'About'"></About>
				<Test v-if="currentView === 'Test'"></Test>
				<Log v-if="currentView === 'Log'"></Log>
			</view>
		</view>
	</view>
</template>

<script>
	import HeaderTop from "components/header-top/index.vue";
	import SystemMenu from "components/system-menu/index.vue";
	import Connect from "pages/views/Connect";
	import Home from "pages/views/Home";
	import About from "pages/views/About";
	import Test from "pages/views/Test";
	import Log from "components/log/log.vue"
	export default {
		name: "App",
		components: {
			HeaderTop,
			SystemMenu,
			Connect,
			Home,
			About,
			Test,
			Log
		},
		data() {
			return {
				menuList: [{
						name: '主页',
						path: 'Home',
						icon: 'home'
					},
					{
						name: '设置',
						path: 'About',
						icon: 'gear'
					}
					
					// ,{
					// 	name: '测试',
					// 	path: 'Test',
					// 	icon: 'gear'
					// },
					,{
						name: '日志',
						path: 'Log',
						icon: 'gear'
					}
				],
				currentPath: '',
				currentView: 'Connect',
				statusBarHeight: 0
			};
		},
		onLoad() {
			uni.$on('updateDeviceStatus', this.handleUpdate)
			const info = uni.getSystemInfoSync();
			this.statusBarHeight = info.statusBarHeight;
		},
		computed: {
			bgClass() {
				const path = this.currentView;
				if (path === 'Connect') {
					return 'bg-white';
				} else if (path === 'Home') {
					return 'bg-black';
				}
				return '';
			}
		},
		methods: {
			handleUpdate(data) {
				if (data) {
					console.log("监听到" + data);
					this.currentView = 'Home';
				}
			},
			updateCurrentPath() {
				const pages = getCurrentPages();
				const current = pages[pages.length - 1];
				this.currentPath = '/' + current.route;
			},
			navigate(path) {
				this.currentView = path;
			},
			isActive(path) {
				return this.currentView === path;
			}

		}
	};
</script>

<style scoped>
	// 去除白边   
	* {
		margin: 0;
		padding: 0;

		box-sizing: border-box;
	}

	html,
	body {
		margin: 0;
		padding: 0;

		background-color: #ffffff;
	}


	#app {
		display: flex;
		flex-direction: column;
		height: 100vh;

		background-color: #ffffff;
	}

	/* 顶部导航栏 */
	.header {
		width: 100%;
		height: 90rpx;
		color: white;
		display: flex;
		align-items: center;
		font-size: 24px;
	}

	/* 中间区域：侧边栏 + 内容 */
	.main {
		flex: 1;
		display: flex;
		height: 100%;
		overflow: hidden;
	}

	/* 侧边栏 */
	.sidebar {
		width: 90rpx;
		background-color: #eeeeee;
		color: #fff;
		padding-top: 10px;
		box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
	}



	/* 内容区 */
	.content {
		flex: 1;

		background-color: #3c3c3c;
	}

	.bg-white {
		background-color: white;

		flex-direction: column;
	}

	.bg-black {
		background-color: black;
		min-height: 100vh;
		color: white;
		/* 黑背景文字白色 */
	}

	.sidebar-a {
		width: 180rpx;
		background-color: #ffffff;
		padding-top: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.menu-item {
		width: 90rpx;
		margin-bottom: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #666;
		font-size: 24rpx;
		transition: color 0.3s;
	}

	.menu-item.active {
		color: #f9001d;
	}

	.menu-icon {
		width: 60rpx;
		height: 60rpx;
		margin-bottom: 10rpx;
	}

	.menu-text {
		text-align: center;
	}
</style>