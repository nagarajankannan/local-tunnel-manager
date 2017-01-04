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
      script: __dirname + '/local-tunnel.js',
      exec_mode: 'cluster',
      instances: 1,
      max_memory_restart: '100M',
      args: _.flatten(_.toPairs(params))
    }, function(err, apps) {
      console.log("starting..");
      console.log("use command `pm2 ls` for status and `pm2 log` for logs");
      pm2.disconnect();
      if (err) throw err;
    });
  });
}