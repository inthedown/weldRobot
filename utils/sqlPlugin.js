// sql.js
import {
	uuid
} from '@/utils/uuid.js'
const sql = {
	dbName: 'mydb.db',
	opened: false,
	initSqls: [
		`CREATE TABLE IF NOT EXISTS weld_job_config (  --焊接工艺包配置表
      uuid VARCHAR(255) PRIMARY KEY NOT NULL,       -- 主键，唯一标识
      name VARCHAR(256) NOT NULL,                   -- 工艺包名称
      amplitude VARCHAR(36),                         -- 焊枪摆幅
      electric VARCHAR(36),                          -- 焊机电流
      voltage VARCHAR(20),                           -- 焊机弧长校正电压
      speed VARCHAR(36),                             -- 焊枪行进速度
      create_time VARCHAR(20),                       -- 创建时间
      update_time VARCHAR(20)                        -- 更新时间
    );`,
		`CREATE TABLE IF NOT EXISTS weld_controller_info ( -- 控制器设备信息表
      uuid VARCHAR(255) PRIMARY KEY NOT NULL,        -- 主键，唯一标识
      controller_id VARCHAR(36) NOT NULL,            -- 控制器设备id
      controller_ip VARCHAR(16),                      -- 控制器IP地址
      init_position VARCHAR(1024),                    -- 机器人初始位置参数（JSON格式）
      created_time VARCHAR(20),                       -- 创建时间
      last_con_time VARCHAR(20)                       -- 最近连接时间
    );`
	],
	// 打开数据库（内部自动判断）
	openDatabase() {
		return new Promise((resolve, reject) => {
				if (plus.sqlite.isOpenDatabase({
					name: this.dbName,
					path: `_doc/${this.dbName}`
				})) {
					// 已经打开
					console.log('✅ 数据库已经打开');
					return resolve();
				}
				plus.sqlite.openDatabase({
					name: this.dbName,
					path: `_doc/${this.dbName}`,
					success: () => {
						console.log('✅ 数据库打开成功');
						resolve();
					},
					fail: e => {
						console.error('❌ 数据库打开失败', e);
						reject(e);
					}
				});
			});
	},

	// 判断是否打开
	isOpenDatabase() {
		return plus.sqlite.isOpenDatabase({
			name: this.dbName,
			path: `_doc/${this.dbName}`
		});
	},

	// 关闭数据库
	closeDatabase() {
		return new Promise((resolve, reject) => {
			plus.sqlite.closeDatabase({
				name: this.dbName,
				success: () => {
					this.opened = false;
					console.log('✅ 数据库关闭成功');
					resolve();
				},
				fail: e => reject(e)
			});
		});
	},

	// 执行增删改
	executeSql(sqlStr) {
		return this.openDatabase().then(() => {
			return new Promise((resolve, reject) => {
				console.log(sqlStr);
				plus.sqlite.executeSql({
					name: this.dbName,
					sql: sqlStr,
					success: () => resolve(),
					fail: e => reject(e)
				});
			});
		});
	},

	// 查询
	selectSql(sqlStr) {
		return this.openDatabase().then(() => {
			return new Promise((resolve, reject) => {
				console.log(sqlStr);
				plus.sqlite.selectSql({
					name: this.dbName,
					sql: sqlStr,
					success: data => resolve(data),
					fail: e => reject(e)
				});
			});
		});
	},

	// 执行事务
	transaction(sqlList = []) {
		// sqlList 格式: [ { sql: 'INSERT ...', params: [] }, { sql: 'UPDATE ...', params: [] } ]
		if (!Array.isArray(sqlList) || sqlList.length === 0) {
			return Promise.reject(new Error('事务 SQL 列表不能为空'));
		}

		return this.openDatabase().then(() => {
			return new Promise((resolve, reject) => {
				plus.sqlite.transaction({
					name: this.dbName,
					operation: () => {
						const promises = sqlList.map(item =>
							new Promise((res, rej) => {
								plus.sqlite.executeSql({
									name: this.dbName,
									sql: item.sql,
									success: () => res(),
									fail: e => rej(e)
								});
							})
						);

						Promise.all(promises)
							.then(() => {
								console.log('✅ 事务执行成功');
								resolve();
							})
							.catch(err => {
								console.error('❌ 事务执行失败', err);
								reject(err);
							});
					},
					fail: e => reject(e)
				});
			});
		});
	},

	//创建表
	async initDatabase() {
		try {
			for (const sql of this.initSqls) {
				// 依次执行建表语句，确保顺序
				await this.executeSql(sql);
			}
			console.log('数据库初始化完成');
		} catch (e) {
			console.error('数据库初始化失败', e);
		}
	},
	// 获取当前格式化时间
	formatTime(date = new Date()) {
		const pad = n => n.toString().padStart(2, '0');
		const y = date.getFullYear();
		const m = pad(date.getMonth() + 1);
		const d = pad(date.getDate());
		const h = pad(date.getHours());
		const min = pad(date.getMinutes());
		const s = pad(date.getSeconds());
		return `${y}-${m}-${d} ${h}:${min}:${s}`;
	},

	// 全 0 初始位置 JSON
	defaultInitPosition() {
		return JSON.stringify({
			x: 0,
			y: 0,
			z: 0,
			rx: 0,
			ry: 0,
			rz: 0
		});
	},

	//更新设备信息 

	// 插入或更新设备信息
	insertOrUpdateDevice(deviceIp) {
		const now = this.formatTime();

		return this.selectSql(
			`SELECT uuid FROM weld_controller_info WHERE controller_ip = '${deviceIp}'`
		).then(rows => {
			if (rows.length === 0) {
				// 不存在 → 插入
				const id = uuid();
				const controller_id = uuid();
				const sql = `
				  INSERT INTO weld_controller_info 
				  (uuid, controller_id, controller_ip, init_position, created_time, last_con_time)
				  VALUES (
				    '${id}',
				    '${controller_id}',
				    '${deviceIp}',
				    '${this.defaultInitPosition()}',
				    '${this.formatTime()}',
				    '${this.formatTime()}'
				  )
				`;
				return this.executeSql(sql
				).then(() => {
					console.log(`✅ 新增设备成功`);
				}).catch(err=>{
					console.log(err.message)
				});
			} else {
				// 存在 → 更新 last_con_time
				return this.executeSql(
					`UPDATE weld_controller_info SET last_con_time = '${now}' WHERE controller_ip = '${deviceIp}'`
				).then(() => {
					console.log(`♻ 更新设备  的 last_con_time 成功`);
				});
			}
		}).catch(err => {
			console.error("❌ 插入或更新设备失败", err.message);
		});
	},


	//查询初始位姿
	getRobotPosition(deviceIp) {
		return this.selectSql(`select * from weld_controller_info  where controller_ip= '${deviceIp}'`).then(res => {
			if (res && res.length > 0) {
				return res[0]; // 返回第一个结果
			}
			return null; // 如果没有结果，返回 null
		}).catch(err => {
			console.error('❌ 查询初始位姿失败', err);
			throw err; // 抛出错误以便上层处理
		});
	},
  // 重置初始位姿
  resetRobotPosition(deviceIp, position){
    return this.executeSql(
      `UPDATE weld_controller_info SET init_position = '${JSON.stringify(position)}' WHERE controller_ip = '${deviceIp}'`
    ).then(() => {
      console.log(`✅ 重置初始位姿成功`);
    }).catch(err => {
      console.error('❌ 重置初始位姿失败', err.message);
      throw err; // 抛出错误以便上层处理
    });
  }
};

export default sql;