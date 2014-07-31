// Globals
var active_file,
	current_buffer, 
	debugData,
	lstor,
	workspace,
	HOST,
	SOURCE;
	parseOn = true,
	canvas_size = {
		width: 0,
		height: 0
	};

function rekey() {
	for (var e in workspace) {
		workspace[e].key = (e + 1).toString().replace(/^0+/, '');
	}
}

init_local_storage();

/** document.ready
 *
 */
$(document).ready(function() {
	
	init_ace();
	
	init_canvas();	
	
	init_jquery_ui();

	init_editor_events();

    load_file_list();

    init_toolbar();

    document.getElementById('file-picker').addEventListener('change', handleFileSelect, false);

});

/*function parser(onoff) {
	editor.
}*/

function deleteProject() {
	lstor.clear("scales_workspace");
	clear_workspace();
	reload_list();
	return ("Project deleted.");
}

function deleteFile (fname) {
	var index = get_index_from_title(fname);
	workspace.remove(index, index);
	reload_list();
	return (fname + " deleted.");
}

function renameFile (oldName, newName) {
	var index = get_index_from_title(oldName);
	workspace[index].title = newName;
	reload_list();
	return (oldName + " renamed to " + newName + ".");
}

function useParser(truefalse) {
	parseOn = truefalse;
	editor.getSession().clearAnnotations();	
	return parseOn ? "Parser enabled." : "Parser disabled.";
}

var get_index_from_title = function(title) {
	for (var file in workspace) {
		if (workspace[file].title == title) {
			return file;
		}
	}
}

/** init_local_storage
 * Sets up localStorage (lstor), creating default workspace if none
 * already exists in lstor. Initilizes workspace buffer object from lstor.
 */
function init_local_storage() {

	// abbreviation for window.localStorage
	lstor = window.localStorage;

	// If workspace is represented in the lstor, load it into the buffer
	if (lstor.getItem("scales_workspace")) {
		// Populate the workspace buffer from the lstor:
		workspace = JSON.parse(lstor.getItem("scales_workspace"));
	}
}

/** load_file_list()
 *  Creates a list of files using the global workspace object
 *  and renders it to the document.
 */
function load_file_list() {
	
	// Save the workspace to the lstor:
	

	// Make the list
    var $ul = $("<ul/>", {class: 'file-list'});
    
    // Add the file list items to the list:
    for (var file in workspace) {
	    $ul.append(get_list_item(workspace[file]));
    }
    
    // Make sure there are no blank list items:


    // Add the list to the container div:
    $('#file-list-container').append($ul);
    
    

	// If there's no active file, activate the last file in the list	
	if (!active_file && workspace && workspace.length > 0) {
		$('#' + workspace[workspace.length-1].title).trigger("click");
	}

	$('#save-changes-button').click();
    /** get_list_item(file_obj)
     *	Returns an html <li> element for the specified file.
     *  @param file_obj A JSON object representing a file.
     *  @return an <li> element for the file.
     */
    function get_list_item(file_obj) {
        
        // Build the empty <li> element:
        var $li = $('<li/>', {
            id: file_obj.title,
            class: 'file-list',

            // When clicked:
            click: function()  {
            	
            	// De-activate the previously active list item:
            	$('li.active').removeClass('active');
            	
            	// Set the global active_file to the selected file:
            	active_file = file_obj;

            	// Activate this list item: 
             	$(this).addClass('active');

            	// Enable writing in the Ace editor:
            	editor.setReadOnly(false);

            	// Load file contents into the editor:
            	editor.setValue(file_obj.contents);
             }
        });
        var $icon = $('<span/>', {class: 'glyphicon glyphicon-file'});

        if (file_obj.title) {
	        // Place the file's title as the text in the <li> elem:
	        $li.append($icon);
	        $li.append(" ");
	        $li.append(file_obj.title);
   		}
       
    	return $li;
    };
}

/** reload_list()
 *  Clears out the previously rendered file list and generates a new 
 *  one from scratch.
 */
function reload_list() {
	$('#file-list-container').empty();
	load_file_list();
}

/** init_toolbar
 * Creates event listeners for the icons in the toolbar
 */
function init_toolbar() {
	
	// New File (Split button)

	// Blank file	
	$('#new-file-button').click( function() {
		// New file
		file_name = prompt("Enter a name for the file:");
		if (!workspace) {
			workspace = [];
		}
		if (file_name) {
            workspace.push({
                "title": file_name,
                "language": "scala",
                "key": workspace.length,
                "contents": "",
                "dirty": false
            });
		}
		active_file = workspace[workspace.length];
  		reload_list();
	}); 

	// Empty Project 
	$('#empty-project-button').click( function() {
		clear_workspace();
		reload_list();
		init_ace();
	});
	$('#from-disk').click( function() {
		$('#file-picker').click();
	});

	$('#from-gist').click( function() {
		var gistid = null;
		gistid = prompt("Please enter the Gist ID:", "f1c887d451ac8c4d8a1f");
		
		// If they didn't hit cancel
		if (gistid) {
			open_gist(gistid);
		}
	});


	// Save Changes button
	// Saves the current workspace buffer into the local storage object
	$('#save-changes-button').click( function() {
		if (workspace) {
			lstor.setItem("scales_workspace", JSON.stringify(workspace));
		}
	});

	// Zoom out button
	// Decreases editor font size
	$('#zoom-out-button').click( function() {
		editor.setOption('fontSize', editor.getOption('fontSize') - 2);
	});

	// Zoom In button
	// Increases editor font size
	$('#zoom-in-button').click( function() {
		editor.setOption('fontSize', editor.getOption('fontSize') + 2);
	});
	// Editor Options button
	// Shows ace's options menu
	$('#editor-options-button').click( function() {
		editor.execCommand("showSettingsMenu");
	});
	// Build & Run button
	// Executes XHR's to dynamically load and run javascript files
	// created by the server.
	$('#build-run-button').click( function() {
	
		HOST = "/compile";
		// Save the workspace to local storage
		$('save-changes-button').click();
		// Send the source code to the compiler and execute the result:
		var build_request = $.ajax({
			beforeSend: function() {
				$('#playground pre').remove();
				$('#scales-spinner').show();
			},
			type: "POST",
			url: HOST,
			data: JSON.stringify(workspace),
			dataType: "json",
			contentType: "application/json",

			// If it compiles, get the scripts it produced:
			success: function (data) {
				// TODO: remove hard-coded file names
				var build_data = $.ajax({
					url: data.url,
					dataType: "script",
					success: function() {
						var canvas = document.querySelector('#output');
						if ($('#fullscreen-check').is(':checked')) {
							if (canvas.mozRequestFullScreen) {		
								console.log(canvas + " says, 'fullscreen, please'");				        
								
							}	
						}
					    Foo().main();					
					},
					complete: function() {
						$('#scales-spinner').hide();
					}

				});	
			},
			error: function (error_msg) {
				debugData = error_msg;
				render();
				$('#playground').append('<pre style="z-index: 300;">'+error_msg.responseJSON.error+'</pre>');
			},
			complete: function() {
				$('#scales-spinner').hide();
			}
		});	
	});

	$('#fullscreen-button').click( function() {
		toggleFullScreen();
	});
	$('#replay-button').click( function() {
		try {
			Foo().main();
		} catch(e) {
			console.error(e);
		}
	});
}

/** init_ace
 * Initializes the ACE editor.
 */
function init_ace() {
	// Turn the editor div (#editor) into an Ace editor:
	editor = ace.edit('editor');
	editor.setTheme('ace/theme/monokai');
	editor.getSession().setMode('ace/mode/scala');

	// Wrap text based on size of editor panel:
	var valstr = "/* Welcome to the Scales IDE.";
	valstr += "\nTo use this editor, either choose a file from the list on the left\n";
	valstr += "or create a New File using the button at the top.";
	editor.setValue(valstr);
	editor.setOption("wrap", "free");
	editor.setOption('fontSize', 14);
	editor.setReadOnly(true);

	editor.commands.addCommands([{
        name: 'buildAndRun',
        bindKey: {win: 'Ctrl-Enter',  mac: 'Command-Return'},
        exec: function(editor) {
            $('#build-run-button').trigger("click");
        },
        readOnly: true
	}, {
		name: 'zoomIn',
		bindKey: {win: 'Ctrl-Alt-=', mac: 'Command-Alt-='},
		exec: function(editor) {
			$('#zoom-in-button').click();	
		},
		readOnly: true
	}, {
		name: 'zoomOut',
		bindKey: {win: 'Ctrl-Alt--', mac: 'Command-Alt--'},
		exec: function(editor) {
			$('#zoom-out-button').click();	
		},
		readOnly: true
	}]);
}

/** init_canvas
 * Sets the canvas' html attributes 'width' and 'height' to be the same as 
 * its parent container's css attributes for 'width' and 'height'.
 *
 * Changing the canvas' css attributes directly seems to stretch the image.
 */
function init_canvas() {
	$('canvas').attr('width', $('#autodiv').css('width'));
	$('canvas').attr('height', $('#autodiv').css('height'));
}

/** init_jquery_ui
 * Initializes jQueryUI elements (resizable, draggable, etc.)
 */
function init_jquery_ui() {

	// Make header resizable with a handle on the bottom.
	$('#header').resizable({
		handles: "s",
		stop: function() {
			render();
		}
	});

	// Triggered on header resize: resize other elements to fit:
	// (Magic numbers used to ensure accomodation for resize handles.)
	$('#header').resize( function() {
		$('#panels').css('top', parseInt($(this).css('height')) + 9 + "px");
		$('#autodiv').css("left", $("#resizable").css("width"));
        $('#autodiv').css("right", "0");
		$('#context-list').css('top', 
			parseInt($(this).css('height')) + 9 + "px");
		$('canvas').attr('width', $('#autodiv').css('width'));
		$('canvas').attr('height', $('#autodiv').css('height'));
		// render(); // Redraw canvas
	});
	

	// Make context-list resizable with a handle on the right:
	$('#context-list').resizable( {
        handles: "e",
        stop: function() {
    		render();
    	}
    });

	// Triggered on context-list (project explorer) resize...
	// Automatically resize the panels to the right:
	// (Magic numbers used to ensure accomodation for resize handles.)
	$('#context-list').on("resize", function() {
		$('#panels').css('left', 
			parseInt($('#context-list').css('width'))-10 + 'px');
		$('canvas').attr('width', $('#autodiv').css('width'));
		$('canvas').attr('height', $('#autodiv').css('height'));
		// render(); // Redraw canvas
    });

	// Set resizable container for Ace editor with handle to right:
	$( "#resizable" ).resizable( {
        handles: "e",
        stop: function() {
        	render();
        }
    });
	
	// Triggered when Ace editor panel is resized:
    $("#resizable").resize( function() {
	
		// Notify Ace to update its size:
        editor.resize();
	
		// Automatically resize right panel to fill the
		// remainder of div#panels:
        $('#autodiv').css("left", $("#resizable").css("width"));
        $('#autodiv').css("right", "0");
		$('#current-file').css('right',$('#resizable').css('right'));
		$('canvas').attr('width', $('#autodiv').css('width'));
		$('canvas').attr('height', $('#autodiv').css('height'));
		// render(); // Redraw canvas
    }); 
}


/** exec_parser
 *  Executes the PEG.js parser
 */
function exec_parser() {
	if (Parser && parseOn)
    try {
      editor.getSession().clearAnnotations();
      Parser.parse(editor.getValue());
    } catch(exn) {
      if (!editor.getSession().$annotations) {
        editor.getSession().$annotations = [];
      }

      var myAnno = {
        "column": exn['column'],
        "row": exn['line'] - 1,
        "type": "error",
        "raw": exn['message'],
        "text": exn['message']
      };
      
      editor.getSession().$annotations.push(myAnno);
      editor.getSession().setAnnotations(editor.getSession().$annotations);
    } // catch(exn)
}

/** update_buffer
 *  Stores the editor's contents into the workspace buffer.
 */
function update_buffer() {


	workspace[get_index_from_title(active_file.title)].contents = editor.getValue();
	// Find the approprate file in the workspace
}

/** init_parser
 * Initializes parser module. Parses code on change, either passing or
 * encountering an exception. If an exception is thrown, it is caught in
 * this function and its details are applied to the editor as annotations.
 */
function init_editor_events() {
  // Syntax checking/error reporting
  editor.on("change", function(e) {
  	if (active_file) {
	    exec_parser();
   		update_buffer();
   	}
  });

}

/** render()
 * renders the red square on the canvas.
 */
function render() {
	var canvas = document.querySelector('#output');

	canvas_size = {
		width: canvas.width,
		height: canvas.height
	};

	$('#playground').empty();
	
	var $canvas = $('<canvas/>', {
		id: 'output',
		width: canvas_size.width,
		height: canvas_size.height
	});

	$('#playground').append($canvas);
	
	try {
		Foo().main()
	} catch (e) {
		console.error(e);
	}
}

function clear_workspace() {
	active_file = null;
	
	workspace = [];
}

/** window.onbeforeunload
 * Before leaving the page, trigger a save.
 */
window.onbeforeunload = function() {
	document.querySelector('#save-changes-button').click();
};

/** toggleFullScreen
 *  Work in progress
 */
function toggleFullScreen() {
	var canvas = document.querySelector('#output');
	
	// Mozilla
	if (canvas.mozRequestFullScreen) {
		if (fullScreen) {
			document.mozCancelFullScreen();
			

		} else {
			canvas_size.width = canvas.width;
			canvas_size.height = canvas.height;

			canvas.mozRequestFullScreen();
			$('#output').attr("width",window.outerWidth);
			$('#output').attr("height",window.outerHeight);
			Foo().main();
		}

	// Webkit
	} else if (canvas.webkitRequestFullscreen) {
		if (document.webkitIsFullScreen) {
			document.webkitExitFullscreen();
		} else {
			canvas.webkitRequestFullscreen();
			$('#output').attr("width",window.outerWidth);
			$('#output').attr("height",window.outerHeight);
			render();		

		}
	}
}

// Triggered when the document enters fullscreen (in webkit)
document.addEventListener("webkitfullscreenchange", function(e) {
	if (document.webkitIsFullScreen) {
		console.log(e);
		$('#output').attr("width",window.outerWidth);
		$('#output').attr("height",window.outerHeight);
		//render();		

	}
})


document.addEventListener("mozfullscreenchange", function(e) {
	var canvas = document.querySelector('#output');
	if (fullScreen) {
		console.log(e);
		$('#output').attr("width",window.outerWidth);
		$('#output').attr("height", window.outerHeight);
		Foo().main();
	} else {
		$('#resizable').trigger('resize');
		// canvas.width = canvas_size.width;
		// canvas.height = canvas_size.height;
	}
});

// Trigger fullscreen using ALT+ENTER
document.addEventListener("keydown", function(e) {
	if (e.keyCode == 13 && e.altKey) {
        toggleFullScreen();
    }
});

/** handleFileSelect(e)
 *  loads file from local filesystem
 */
function handleFileSelect(e) {
	var f = e.target.files[0]; // The first file in the file list.
	if (!f) {
		console.log("Failed to open file.");
	} else {
		var file_name = f.name;
		var reader = new FileReader();

		reader.onload = function(e) {
			clear_workspace();

			var contents = e.target.result;
			workspace.push({
                "title": file_name,
                "language": "scala",
                "key": workspace.length,
                "contents": contents,
                "dirty": false
            });

            reload_list();
            try {
				$('ul.file-list li:first-child').trigger("click");
			} catch (e) {
				console.log(e);
			}
		}

		reader.readAsText(f);

	}
}

/** open_gist(gistid)
 *  loads a project from a gist
 *  @param gistid The id of the gist (the last segment of the url)
 */
function open_gist(gistid) {
	$.ajax({
		url: 'https://api.github.com/gists/' + gistid,
		type: 'GET',
		dataType: 'jsonp',
		success: function(gistdata) {
			clear_workspace();
			for (var file in gistdata.data["files"]) {
				
				workspace.push({
					"title": file,
					"language": gistdata.data.files[file].language,
					"key": workspace.length,
					"contents": gistdata.data.files[file].content,
					"dirty": false
		    	});  		
			}
			reload_list();
			try {
				$('ul.file-list li:first-child').trigger("click");
			} catch (e) {
				console.log(e);
			}
		}
  	});
}

var help = "A number of can be accessed directly from the command line:\n\n" +
	
	"\t* deleteFile(<filename>) - " +
	"Removes specified file from project, workspace, and local storage.\n" +
	
	"\t* deleteProject() - " +
	"Deletes EVERYTHING. Then starts you off with a new default project.\n" +

	"\t* renameFile(<oldName>, <newName>) - " +
	"File specified will be renamed to the value of the second parameter.\n" +

	"\t* useParser(true|false) - " +
	"Turns the client-side parser on or off.\n"
	"\t* help - " +
	"Type 'help' at any time to see these instructions again.";

console.log(help);

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
