// sql.js
const sql = {
  dbName: 'mydb.db',
  opened: false,

  // 打开数据库（内部自动判断）
  openDatabase() {
    if (this.opened) return Promise.resolve();
    return new Promise((resolve, reject) => {
      plus.sqlite.openDatabase({
        name: this.dbName,
        path: `_doc/${this.dbName}`,
        success: () => {
          this.opened = true;
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
  executeSql(sqlStr, params = []) {
    return this.openDatabase().then(() => {
      return new Promise((resolve, reject) => {
        plus.sqlite.executeSql({
          name: this.dbName,
          sql: sqlStr,
          params,
          success: () => resolve(),
          fail: e => reject(e)
        });
      });
    });
  },

  // 查询
  selectSql(sqlStr, params = []) {
    return this.openDatabase().then(() => {
      return new Promise((resolve, reject) => {
        plus.sqlite.selectSql({
          name: this.dbName,
          sql: sqlStr,
          params,
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
                  params: item.params || [],
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
  }
};

export default sql;
