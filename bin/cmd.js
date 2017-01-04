#!/usr/bin/env node
console.log("it works!");
var manager = require('../');

var argv = require('yargs')
    .usage('Usage: $0 --port [num] <options>')
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
    .require('port')
    .help('help', 'Show this help and exit')
    .version(require('../package').version)
    .argv;

if (typeof argv.port !== 'number') {
    require('yargs').showHelp();
    console.error('port must be a number');
    process.exit(1);
}

var params = {
    host: argv.host,
    port: argv.port,
    local_host: argv['local-host'],
    subdomain: argv.subdomain,
};

manager.start(params);
