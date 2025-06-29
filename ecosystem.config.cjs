module.exports = {
  apps: [
    {
      name: 'gestao-api',
      script: 'server/index.js',
      env: {
        PORT: 3005
      }
    },
    {
      name: 'gestao-app',
      script: 'npm',
      args: 'run dev',
      env: {
        PORT: 5173
      }
    }
  ]
};
