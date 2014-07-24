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
    val sources = parsedBody.extract[List[SourceFile]]
    println(sources)
    
    contentType = formats("json")
    if (true) {
      Ok(CompileSuccess("output.js"))
    } else {
      NotFound(CompileFailure("whatever"))
    }
  }
}

case class SourceFile(title: String, key: Int, contents: String, language: String, dirty: Boolean)

case class CompileSuccess(url: String)

case class CompileFailure(foo: String)
