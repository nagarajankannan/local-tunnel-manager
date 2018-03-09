#!/usr/bin/env node

var manager = require('../');

var argv = require('yargs')
  .usage('Usage: $0 --port [num] <options>')
  .command('ls', 'shows pm2 status', function() {
    manager.ls();
    process.exit(0);
  })
  .command('delete', 'deletes pm2 process', function(yargs) {
    return yargs
  }, function(argv) {
    manager.delete(argv._[1]);
  })
  .option('k', {
    alias: 'keep',
    describe: 'Start pm2 with a process named as the subdomain. It will not get deleted on subsequent calls. Use --delete instead'
  })
  .option('h', {
    alias: 'host',
    describe: 'Upstream server providing forwarding',
    default: 'http://localtunnel.me'
  })
  .option('s', {
    alias: 'subdomain',
    describe: 'Request this subdomain'
  })
  .option('l', {
    alias: 'local-host',
    describe: 'Tunnel traffic to this host instead of localhost, override Host header to this host'
  })
  .options('o', {
    alias: 'open',
    describe: 'opens url in your browser'
  })
  .option('p', {
    alias: 'port',
    describe: 'Internal http server port',
  })
  .option('ls', {
    alias: 'pm2-ls',
    describe: 'pm2 ls command'
  })
  .require('port')
  .help('help', 'Show this help and exit')
  .version(require('../package').version)
  .argv;

var params = {
  keep: argv.keep,
  host: argv.host,
  port: argv.port,
  local_host: argv['local-host'],
  subdomain: argv.subdomain,
};

if (argv && argv.port && (typeof argv.port !== "number")) {
  require('yargs').showHelp();
  console.error('port must be a number');
  process.exit(1);
} else {
  manager.start(params);
}
