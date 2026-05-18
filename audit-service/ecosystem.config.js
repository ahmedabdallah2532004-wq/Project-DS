module.exports = {
  apps: [{
    name: "audit-service",
    script: "./index.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 3007
    }
  }]
}
