module.exports = {
  apps: [
    {
      name: 'webhook-service',
      script: 'src/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        SERVICE_NAME: process.env.SERVICE_NAME,
        PORT: process.env.PORT
      },
      env_production: {
        NODE_ENV: process.env.NODE_ENV,
        SERVICE_NAME: process.env.SERVICE_NAME,
        PORT: process.env.PORT
      }
    }
  ]
};
