// 控制台错误监控脚本
window.consoleErrors = [];
window.consoleWarnings = [];

// 捕获 console.error
const originalError = console.error;
console.error = function(...args) {
  window.consoleErrors.push({
    type: 'error',
    message: args.join(' '),
    stack: new Error().stack,
    timestamp: new Date().toISOString()
  });
  originalError.apply(console, args);
};

// 捕获 console.warn
const originalWarn = console.warn;
console.warn = function(...args) {
  window.consoleWarnings.push({
    type: 'warning',
    message: args.join(' '),
    timestamp: new Date().toISOString()
  });
  originalWarn.apply(console, args);
};

// 捕获未处理的 Promise 错误
window.addEventListener('unhandledrejection', function(event) {
  window.consoleErrors.push({
    type: 'unhandledrejection',
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    timestamp: new Date().toISOString()
  });
});

// 捕获全局错误
window.addEventListener('error', function(event) {
  window.consoleErrors.push({
    type: 'global',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString()
  });
});

console.log('Error monitor initialized');
