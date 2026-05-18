module.exports = {
  apps: [{
    name: "auth-service",
    script: "./index.js",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 3006
    }
  }]
}
