package edu.depauw.sjss

import org.scalatra._
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
