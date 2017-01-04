# local-tunnel-manager

> runs local tunnel with pm2 manager

## getting started
If you are new to local tunnel, check out what [local tunnel](https://localtunnel.github.io/www/) does for you

## installation
```shell
npm install local-tunnel-manager
```
## usage
you can use the same options as you provide to local tunnel

```
Usage: lt-manager --port [num] <options>

Options:
  -h, --host        Upstream server providing forwarding
                                              [default: "http://localtunnel.me"]
  -s, --subdomain   Request this subdomain
  -l, --local-host  Tunnel traffic to this host instead of localhost, override
                    Host header to this host
  -o, --open        opens url in your browser
  -p, --port        Internal http server port                         [required]
  --help            Show this help and exit                            [boolean]
  --version         Show version number                                [boolean]
```

## example
lt-manager --port 5000 --subdomain mytestdomain

## others
you can use `pm2 ls` and know the lt-manager status

