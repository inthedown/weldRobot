import request from '@/request/request.js';
// 封装业务接口方法
const rest = {
	// 获取设备状态
	getDeviceStatus(customIp) {
		return request('/channel_read?channel=RestChannel&node=weld', {
			method: 'post',
			customIp,
			data: {
				"channel": "RestChannel",
				"node": "weld",
				"data": {
					"type": "devices_status"
				}
			}
		});
	},
	//启动相机流传输
	startImageWs() {
		return request('/channel_read?channel=&node=', {
			method: 'post',
			data: {
				"channel": "RestChannel",
				"node": "weld",
				"data": {
					"type": "initial_image",
					"status": 1
				}
			}
		});
	},
	// 停止相机流传输
	stopImageWs() {
		return request('/channel_read?channel=&node=', {
			method: 'post',
			data: {
				"channel": "RestChannel",
				"node": "weld",
				"data": {
					"type": "initial_image",
					"status": 0
				}
			}
		});
	},
	// 获取机械臂当前位置	
	getRobotPosition() {
		return request('/channel_read?channel=&node=', {
			method: 'post',
			data: {
				"channel": "RestChannel",
				"node": "weld",
				"data": {
					"type": "robot_position_query"
				}
			}
		});
	},
	//开始焊缝识别接口
	stratIdentify(data) {
		return request('/channel_read?channel=&node=', {
			method: 'post',
			data
		});
	},
	//开始焊接任务接口
	startTask(original_point, weld_datas) {
		original_point.tool = 1;
		console.log('original_point', original_point);
		console.log('weld_datas', weld_datas);

		return request('/channel_read?channel=&node=', {
			method: 'post',
			data: {
				"channel": "RestChannel",
				"node": "weld",
				"data": {
					"type":"weld_start",
					"original_point": original_point,
					"weld_datas": weld_datas
				}

			}
		});
	},
	//返回初始位姿
	resetRobot(param) {
		return request('/channel_read?channel=&node=', {
			method: 'post',
			data: {
				"channel": "RestChannel",
				"node": "weld",
				"data": {
					"type": "return_original_point",
					"original_point": param
				}
			}
		});
	}
};

export default rest;