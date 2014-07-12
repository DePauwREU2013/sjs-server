package edu.depauw.sjss

import org.scalatra._
import scalate.ScalateSupport

class SJSS extends SJSServerStack {

  get("/") {
    <html>
      <head>
      <script src="foo"></script>
      </head>
      <body>
        <h1>Hello, world!</h1>
        Say <a href="hello-scalate">hello to Scalate</a>.
        <form action="compile" method="POST">
          <input type="submit" value="Push Me" />
          <input type="text" name="files" />
        </form>
        <canvas id="output"></canvas>
      </body>
    </html>
  }
  
  get("/foo") {
    contentType = "application/javascript"
    new java.io.File("foo.js")
  }
  
  post("/compile") {
    val files = params("files") // TODO how to get the map?
    println(files)
    
    contentType = "application/javascript"
    new java.io.File("output.js")
  }
}
