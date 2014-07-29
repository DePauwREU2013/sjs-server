# SJS-Server #

## Build & Run ##

Until the scales library is published, first clone the [sjs-scales](http://github.com/depauwreu2013/sjs-scales) repo and follow the instructions in the README.

```sh
$ cd sjs-server
$ sbt
> container:start
> browse
> ~ ;copy-resources;aux-compile
```

If `browse` doesn't launch your browser, manually open [http://localhost:8080/](http://localhost:8080/) in your browser.

*In the current version, you must have a `main.scala` file, which will be wrapped in main method boilerplate by the server.*
