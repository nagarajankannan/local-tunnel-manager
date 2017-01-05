var localtunnel = require('localtunnel'),
  _ = require('lodash');

function startTunneling(data) {
  var params = _getParamsAsObject(data);
  var tunnel = localtunnel(params.port, {
    subdomain: params.subdomain
  }, function(err, tunnel) {
    if (err) {
      console.log("Error while creating localtunnel", err);
      process.send({
        type: 'process:msg',
        error: err.message
      });
    } else {
      console.log("success", tunnel.url);
      process.send({
        type: 'process:msg',
        data: tunnel
      });
    }
  });

  tunnel.on('close', function() {
    console.log("closing tunnel..");
  });

  process.on('uncaughtException', function() {
    process.exit(1);
  });
}

function _getParamsAsObject(data) {
  var parameters = [];
  while (data.length) parameters.push(data.splice(0, 2));
  return _.fromPairs(parameters);
}

if (!module.parent) {
  startTunneling(process.argv.splice(2));
}

module.exports = {
  startTunneling: startTunneling
};