module.exports = {
  apps: [
    {
      name: 'yaavs-v5',
      script: 'node .next/standalone/server.js',
      cwd: '/opt/yaavs-v5',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/yaavs-v5/err.log',
      out_file: '/var/log/yaavs-v5/out.log',
      log_file: '/var/log/yaavs-v5/combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.next'],
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
}; 