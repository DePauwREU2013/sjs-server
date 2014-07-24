package edu.depauw.sjss

import org.scalatra._
import scalate.ScalateSupport

import org.json4s.{DefaultFormats, Formats}
import org.scalatra.json._

class SJSS extends SJSServerStack with JacksonJsonSupport {
  protected implicit val jsonFormats: Formats = DefaultFormats

  get("/") {
    val submitScript = scala.xml.Unparsed(
      """
      | $("#testform").submit(function(e) {
      |   var files = {
      |     "files": {
      |       "fileone.scala": {
      |         "filename": "fileone.scala",
      |         "type": "text/plain",
      |         "content": $("input[name='fileone']").val()
      |       },
      |       "filetwo.scala": {
      |         "filename": "filetwo.scala",
      |         "type": "text/plain",
      |         "content": $("input[name='filetwo']").val()
      |       }
      |     }
      |   };
      |   alert(JSON.stringify(files));
      |   var callback = function() {};
      |   $.ajax({
      |     type: "POST",
      |     url: "compile",
      |     data: JSON.stringify(files),
      |     success: callback,
      |     dataType: "json",
      |     contentType: "application/json",
      |     processData: false
      |   });
      |   return false;
      | })
      """.stripMargin)
      
    <html>
      <head>
      <script src="//code.jquery.com/jquery-1.11.0.min.js"></script>
      <script src="foo"></script>
      </head>
      <body>
        <h1>Hello, world!</h1>
        Say <a href="hello-scalate">hello to Scalate</a>.
        <form id="testform">
          <input type="submit" value="Push Me" />
          <input type="text" name="fileone" value="file one" />
          <input type="text" name="filetwo" value="file two" />
        </form>
        <canvas id="output"></canvas>
        <script>
          { submitScript }
        </script>
      </body>
    </html>
  }
  
  get("/foo") {
    contentType = "application/javascript"
    new java.io.File("foo.js")
  }
  
  post("/compile") {
    println(params)
    val files = params("files") // TODO how to get the map?
    println(files)
    
    contentType = formats("json")
    new java.io.File("output.js") // TODO return a URL for this embedded in JSON
  }
}
