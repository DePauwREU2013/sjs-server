package edu.depauw.sjss

import org.scalatra._
import scalate.ScalateSupport
import org.json4s.{DefaultFormats, Formats}
import org.scalatra.json._

class SJSS extends SJSServerStack with JacksonJsonSupport {
  protected implicit val jsonFormats: Formats = DefaultFormats
  
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
