package edu.depauw.sjss

import org.scalatra._
import scalate.ScalateSupport
import org.json4s.{DefaultFormats, Formats}
import org.scalatra.json._
import scala.scalajs.tools.classpath.PartialIRClasspath

import fiddle.Compiler

class SJSS extends SJSServerStack with JacksonJsonSupport {
  protected implicit val jsonFormats: Formats = DefaultFormats
  
  get("/foo") {
    contentType = "application/javascript"
    new java.io.File("foo.js")
  }
  
  post("/compile") {
    contentType = formats("json")
    
    val sources = parsedBody.extract[List[SourceFile]]
    println(sources)
    
    // TODO combine all sources into one; wrap in appropriate template
    // TODO the result needs to come back as a file name, not the file contents
    fastOpt(sources.head.contents) match {
      case (output, Some(result)) =>
        Ok(CompileSuccess(result))
      case (output, None) =>
        NotFound(CompileFailure(output))
    }
  }

  def compile(txt: String): (String, Option[String]) =
    compileStuff(txt, Compiler.export)
  def fastOpt(txt: String): (String, Option[String]) =
    compileStuff(txt, p => Compiler.exportCI(Compiler.fastOpt(p)))
  def fullOpt(txt: String): (String, Option[String]) =
    compileStuff(txt, p => Compiler.exportNC(Compiler.fullOpt(Compiler.fastOpt(p))))
    
  def compileStuff(code: String, processor: PartialIRClasspath => String): (String, Option[String]) = {
    val output = scala.collection.mutable.Buffer.empty[String]

    val res = Compiler.compile(
      code.getBytes,
      output.append(_)
    )

    (output.mkString, res.map(processor))
  }
}

// Case classes defining the JSON interfaces:
case class SourceFile(title: String, key: Int, contents: String, language: String, dirty: Boolean)

case class CompileSuccess(url: String)

case class CompileFailure(error: String)
