import sbt._
import Keys._
import org.scalatra.sbt._
import org.scalatra.sbt.PluginKeys._
import com.mojolly.scalate.ScalatePlugin._
import ScalateKeys._
import scala.scalajs.sbtplugin.ScalaJSPlugin._

object SjsserverBuild extends Build {
  val Organization = "edu.depauw"
  val Name = "SJS-Server"
  val Version = "0.1.0-SNAPSHOT"
  val ScalaVersion = "2.11.1"
  val ScalatraVersion = "2.3.0"

  lazy val runtime = project
    .settings(scalaJSSettings:_*)
    .settings(
      resolvers += Resolver.sonatypeRepo("snapshots"),
      libraryDependencies ++= Seq(
        "org.scala-lang" % "scala-reflect" % scalaVersion.value,
        "org.scala-lang.modules.scalajs" %%% "scalajs-dom" % "0.6",
        "edu.depauw" %%% "sjs-scales" % "0.1-SNAPSHOT",
        "com.scalatags" %%% "scalatags" % "0.3.8",
        "org.scala-lang.modules" %% "scala-async" % "0.9.1" % "provided",
        "com.scalarx" %%% "scalarx" % "0.2.5",
        "com.nativelibs4java" %% "scalaxy-loops" % "0.1.1" % "provided"
      ),
      autoCompilerPlugins := true,
      scalaVersion := "2.11.1"
    )

  lazy val server = Project (
    "sjs-server",
    file("."),
    settings = seq(com.typesafe.sbt.SbtStartScript.startScriptForClassesSettings: _*) ++ Defaults.defaultSettings ++ ScalatraPlugin.scalatraWithJRebel ++ scalateSettings ++ Seq(
      organization := Organization,
      name := Name,
      version := Version,
      scalaVersion := ScalaVersion,
      resolvers += Classpaths.typesafeReleases,
      resolvers += Resolver.url("scala-js-releases",
        url("http://dl.bintray.com/content/scala-js/scala-js-releases"))(
          Resolver.ivyStylePatterns),
      libraryDependencies ++= Seq(
        "org.scalatra" %% "scalatra" % ScalatraVersion,
        "org.scalatra" %% "scalatra-scalate" % ScalatraVersion,
        "org.scalatra" %% "scalatra-specs2" % ScalatraVersion % "test",
        "org.scalatra" %% "scalatra-json" % "2.3.0",
        "org.json4s" %% "json4s-jackson" % "3.2.9",
        "org.scala-lang" % "scala-compiler" % scalaVersion.value,
        "com.typesafe.akka" %% "akka-actor" % "2.3.2",
        "org.scala-lang.modules.scalajs" % s"scalajs-compiler_${scalaVersion.value}" % "0.5.2",
        "org.scala-lang.modules.scalajs" %% "scalajs-tools" % "0.5.2",
        "org.scala-lang.modules" %% "scala-async" % "0.9.1" % "provided",
        "com.scalatags" %% "scalatags" % "0.3.8",
        "ch.qos.logback" % "logback-classic" % "1.0.6" % "runtime",
        "org.eclipse.jetty" % "jetty-webapp" % "8.1.8.v20121106" % "compile;container",
        "org.eclipse.jetty.orbit" % "javax.servlet" % "3.0.0.v201112011016" % "compile;container;provided;test" artifacts (Artifact("javax.servlet", "jar", "jar"))
      ),
      resources in Compile ++= {
        (managedClasspath in (runtime, Compile)).value.map(_.data)
      },
      scalateTemplateConfig in Compile <<= (sourceDirectory in Compile){ base =>
        Seq(
          TemplateConfig(
            base / "webapp" / "WEB-INF" / "templates",
            Seq.empty,  /* default imports should be added here */
            Seq(
              Binding("context", "_root_.org.scalatra.scalate.ScalatraRenderContext", importMembers = true, isImplicit = true)
            ),  /* add extra bindings here */
            Some("templates")
          )
        )
      }
    )
  )
}
