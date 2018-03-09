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
  if (params.keep && !params.subdomain) {
    require('yargs').showHelp();
    console.log('Missing subdomain param when using keep');
    return false;
  }

  async.waterfall([
    async.apply(_connectPm2, params),
    params.keep ? noop : _deleteApp,
    _startApp,
    _getProcess,
    _sendMessage,
  ], handleCallback);
};

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

var noop = function(params, callback) { callback(null, params) }

var _deleteApp = function(params, callback) {
  var name = 'local-tunnel-manager';
  if (params.keep) name = params.subdomain

  pm2.delete(name, function() {
    callback(null, params);
  });
};

var _startApp = function(params, callback) {
  var name = 'local-tunnel-manager';
  if (params.keep) name = params.subdomain

  pm2.start({
    name: name,
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
  var name = 'local-tunnel-manager';
  if (params.keep) name = params.subdomain

  pm2.list(function(err, result) {
    pm2Process = _.findLast(result, {
      name: name
    });
    callback(err, params, pm2Process);
  });
};

var _sendMessage = function(params, pm2Process, callback) {
  pm2.launchBus(function(err, bus) {
    callback(null, params, pm2Process, bus);
  });
};

var handleCallback = function(err, params, pm2Process, messagebus) {
  if (err) {
    console.log(err);
  } else {
    messagebus.on('process:msg', function(result) {
      if (result.error || !result.data) {
        console.log(_.get(result, 'raw.error', 'Error while creating local tunnel.'));
        _deleteApp(params, function() {
          pm2.disconnect();
        });
      } else {
        console.log("success =>", result.data.url);
        pm2ls();
        pm2.disconnect();
      }
    });
  }
}

var pm2ls = function() {
  var localPm2 = __dirname + '/node_modules/.bin/pm2';
  var child = childProcess.spawnSync(localPm2, ['ls']);
  if (child.status === 0) { //checking with process exit code
    console.log(new Buffer(child.stdout).toString());
  } else {
    console.log(new Error("unable to fetch pm2 status"));
  }
};

var pm2delete = function(name) {
  if (!name) return

  pm2.connect(function(err) {
    if (err) {
      console.error(new Error(err));
      process.exit(2);
    }

    pm2.delete(name, function(err) {
      if (err) {
        console.log(new Error(err))
        pm2ls();
        pm2.disconnect();
        process.exit(0);
      }
      else {
        console.log('App', name, 'has been deleted from the pm2 process list')
      }

      pm2ls();
      pm2.disconnect();
      process.exit(0);
    });
  });
}

module.exports = {
  'start': start,
  'getStatus': getStatus,
  'ls': pm2ls,
  'delete': pm2delete,
};
