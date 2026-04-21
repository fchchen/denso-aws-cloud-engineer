export function createLogger(context) {
  const base = {
    requestId: context?.awsRequestId,
    functionName: context?.functionName,
  };

  return {
    info: (message, extra = {}) => log("INFO", message, base, extra),
    warn: (message, extra = {}) => log("WARN", message, base, extra),
    error: (message, extra = {}) => log("ERROR", message, base, extra),
  };
}

function log(level, message, base, extra) {
  console.log(JSON.stringify({ level, message, ...base, ...extra, ts: new Date().toISOString() }));
}
