start
  = decl


// disallowing vars, handled.
// uninitialized vals, handled
decl = vt:vartype id typedef? a:assign? 
{
  if (vt === "var") 
    error("what part of IMMUTABLE do you not understand?")
  
  else if (!a)
  error("You should probably assign something now...you can't change it later!");
}

vartype = val/var 


// Missing equals sign...handled.
// Missing rvalue: also handled.
assign =
 e:eq? n:num? 
{
  if (e && !n)
    error(". . . it equals what?");
  else if (n && !e)
    error("it does WHAT to " + n + "?");
  return parseInt(n);
}

// use of reserved tokens--BOOM! handled!
id = &(p:reserved) {error("You can't call it that!");}
   / [A-Za-z_][A-Za-z_0-9]* sp

typedef
  = COLON typename

eq = '=' sp

val = 'val' sp {return text().trim();}

var = 'var' sp {return text().trim();}


num = [0-9]+ sp {return parseInt(text());}

COLON = ':' sp

reserved
  = typename / vartype

typename
  = int/float/string/unit

int = 'Int' sp
float = 'Float' sp
string = 'String' sp
unit = 'Unit' sp

sp = [ \t]*