var pm2 = require('pm2'),
  _ = require('lodash'),
  childProcess = require('child_process'),
  async = require('async');

var getStatus = function() {
  var pm2Process = _getProcess();
  var status = _.get(pm2Process, 'pm2_env.status', null);
  return status;
};

var start = function(params) {

  async.waterfall([
    async.apply(_connectPm2, params),
    _startApp,
    _getProcess,
    _sendMessage,
  ], function(err, params, pm2Process, messagebus) {
    if (err) {
      console.log(err);
    } else {
      messagebus.on('process:msg', function(result) {
        if(result.error || !result.data){
          console.log(_.get(result, 'raw.error', 'Error while creating local tunnel.'));
          pm2.delete('local-tunnel-manager', function(){
            pm2.disconnect();
          });
        } else {
          console.log("success =>", result.data.url);
          pm2ls();
          pm2.disconnect();
        }
      });
    }
  });
}

var _connectPm2 = function(params, callback) {
  pm2.connect(function(err) {
    if (err) {
      console.error(err);
      process.exit(2);
    } else {
      callback(null, params);
    }
  });
};

var _startApp = function(params, callback) {
  pm2.start({
    name: 'local-tunnel-manager',
    script: __dirname + '/local-tunnel.js',
    exec_mode: 'cluster',
    instances: 1,
    max_memory_restart: '100M',
    args: _.flatten(_.toPairs(params))
  }, function(err) {
    if (err) {
      console.error(err);
      process.exit(2);
    } else {
      callback(null, params);
    }
  });
};

var _getProcess = function(params, callback) {
  var pm2Process = null;
  pm2.list(function(err, result) {
    pm2Process = _.findLast(result, {
      name: 'local-tunnel-manager'
    });
    callback(err, params, pm2Process);
  });
};

var _sendMessage = function(params, pm2Process, callback) {
  pm2.launchBus(function(err, bus) {
    callback(null, params, pm2Process, bus);
  });
}

var pm2ls = function() {
  var child = childProcess.spawnSync('pm2', ['ls']);
  if (child.status === 0) { //checking with process exit code
    console.log(new Buffer(child.stdout).toString());
  } else {
    console.log(new Error("unable to fetch pm2 status"));
  }
};

module.exports = {
  'start': start,
  'getStatus': getStatus,
  'ls': pm2ls
};