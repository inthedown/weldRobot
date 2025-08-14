// logger.js
const logs = [];
let seen = null; // 用于检测循环引用

// function safeStringify(val) {
//   try {
//     if (val === undefined) return 'undefined';
//     if (val === null) return 'null';

//     if (val instanceof Error) {
//       // 处理 Error 对象
//       return val.stack || val.message || String(val);
//     }

//     if (typeof val === 'object') {
//       seen = seen || new WeakSet();
//       if (seen.has(val)) return '[Circular]';
//       seen.add(val);

//       return JSON.stringify(val, (key, value) => {
//         if (typeof value === 'object' && value !== null) {
//           if (seen.has(value)) return '[Circular]';
//           seen.add(value);
//         }
//         return value;
//       });
//     }

//     return String(val);
//   } catch (e) {
//     return String(val);
//   }
// }
function wrapConsoleMethod(type) {
  const orig = console[type];
  console[type] = (...args) => {
    try {
      // 确保 seen 每次都是新实例
      let seen = new WeakSet();

      // 确保 args 是数组
      const safeArgs = Array.isArray(args) ? args : [];

      // 安全 stringify
      const msg = safeArgs.map(arg => {
        try {
          return safeStringify(arg, seen);
        } catch (err) {
          return `[Unserializable: ${err.message}]`;
        }
      }).join(' ');

      // 存日志，安全保护
      try {
        logs.push({ time: new Date().toISOString(), type, msg });
        if (logs.length > 500) logs.shift();
      } catch (err) {
        orig(`日志缓存出错: ${err.message}`);
      }
    } catch (err) {
      // 捕获 wrap 内部的任何错误，不让它影响主流程
      orig(`wrapConsoleMethod 内部出错: ${err.message}`);
    }

    // 始终调用原始 console 方法
    try {
      orig.apply(console, args);
    } catch (err) {
      // 理论上这里不太会出错，但保险起见也捕获
    }
  };
}

// 一个安全 stringify 方法
function safeStringify(value, seen) {
  if (value === undefined) return 'undefined';
  if (typeof value === 'symbol') return value.toString();
  if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
  if (typeof value === 'object' && value !== null) {
    if (seen.has(value)) return '[Circular]';
    seen.add(value);
  }
  return JSON.stringify(value, (_, val) => {
    if (typeof val === 'symbol') return val.toString();
    if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
    return val;
  });
}


// 拦截 log / error / warn
['log', 'error', 'warn'].forEach(wrapConsoleMethod);

export default {
  getLogs() {
    return logs;
  },
  clearLogs() {
    logs.length = 0;
  }
};
