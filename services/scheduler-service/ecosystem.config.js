module.exports = {
  apps: [
    {
      name: 'scheduler-service',
      script: 'src/server.js',
      instances: 1,      // Scheduler usually requires 1 instance to avoid duplicate cron executions, unless we have a distributed lock
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
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
