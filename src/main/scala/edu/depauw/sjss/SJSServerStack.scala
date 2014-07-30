package edu.depauw.sjss

import org.scalatra._
import scalate.ScalateSupport
import org.fusesource.scalate.{ TemplateEngine, Binding }
import org.fusesource.scalate.layout.DefaultLayoutStrategy
import javax.servlet.http.HttpServletRequest
import collection.mutable

trait SJSServerStack extends ScalatraServlet {
  // Removed Scalate stuff
  notFound {
    // remove content type in case it was set through an action
    contentType = null

    serveStaticResource() getOrElse resourceNotFound()
  }
}
