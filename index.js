var pm2 = require('pm2'),
    _ = require('lodash');

module.exports.start = function(params) {
  pm2.connect(function(err) {
    if (err) {
      console.error(err);
      process.exit(2);
    }

    pm2.start({
      name: 'local-tunnel-manager',
      script: './local-tunnel.js',
      exec_mode: 'cluster',
      instances: 1,
      max_memory_restart: '100M',
      args: _.flatten(_.toPairs(params))
    }, function(err, apps) {
      pm2.disconnect(); // Disconnect from PM2
      if (err) throw err;
    });
  });
}