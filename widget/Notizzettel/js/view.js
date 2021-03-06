/**
 * View Module
 * @param {Object} interFace
 * @param {Object} Controller
 * @param {Object} $
 */
MVC.View = (function (interFace, Controller, $) {

	/* public methods */

	interFace.notify = function(message) {
		$("span#notification").html(message);
		$("div#errorContainer").slideDown(500, function() {
			var $self = $(this);
			setTimeout(function(){$self.slideUp(500)}, 3000);
		});
	};
	
	/**
	 * Initialization Method of View.
	 * If lang is set the locale system is used
	 * @param {String} languageData current sytem language
	 */
        interFace.init = function(languageData) {

		// to be sure the document in DOM s really loaded completely
		$(document).ready(function() {
			
			if(languageData) {
				_lang_data = languageData;
				_translateExistingStringsInDOM(languageData.id);
			}

			debug('View init(): initialize what is needed');
			_setClickEvents();
			
		});
	};
		
	/**
	 * Method to build up the view to show the notes list view.
	 * The Data passed in the parameters is filled to the View
	 * Fields accordingly. Afterward the NotesListView is shown,
	 * and all other views gets hided.
	 * @param {String} searchString is used if a previous searchString was used
	 * @param {String-Array} pd data packed in String Array for display in view
	 */
	interFace.showNotesListView = function(searchString, pd) {
		debug('View showUserInterestsData(): write the interests data into DOM and show the div containing interests data');
		var html_code = "";
		var searchstr = "";
		var content = "";
		var number_tags = 5;

		if (searchString != null) {
			searchstr = searchString;
		}
       
		for(var key in pd.notes) {
			var note = pd.notes[key];
			var icon_style = "list-item-icon-dflt";

			switch(note.schema) {
			case "note":
				var description = "";
				var tags ="";
				if(Controller.containsTypeField(note.schema, "reminder") && 
					Controller.shouldReminderAlert(note.reminder, 2)) {
					icon_style ="list-item-icon-note-alert";
				} else {
					icon_style ="list-item-icon-note";
				}
				description = note.content.substring(0,35);
				description = description + " ...";
				tags = _createTagString(note.tags, number_tags);
				content = '<div id="content"><div class="left_float"><span lang="en">Description</span>: '+description+' </div><br \\><div style="margin-left:46px"><span lang="en">Tags</span>: '+tags+'</div></div>';
				break;
			case "todo":
                		//add priority and due and tags
				var priority=note.priority;
				var due=note.start_date;
				var tags = _createTagString(note.tags, number_tags);
				if(Controller.containsTypeField(note.schema, "reminder") && 
					Controller.shouldReminderAlert(note.reminder, 2)) {
					icon_style ="list-item-icon-todo-alert";
				} else {
					icon_style ="list-item-icon-todo";
				}
				content = '<div id="content"><div class="left_float"><span lang="en">Priority</span>: '+priority+' </div><div class="right_float"><span lang="en">Start Date</span>: '+due+' </div><br \\><div style="margin-left:46px"><span lang="en">Tags</span>: '+tags+'</div></div>';
				break;
			case "appointment":
				var location = note.location;
				var due = note.start_date;
				var tags = _createTagString(note.tags, number_tags);
				if(Controller.containsTypeField(note.schema, "reminder") && 
					Controller.shouldReminderAlert(note.reminder, 2)) {
					icon_style ="list-item-icon-appoint-alert";
				} else {
					icon_style ="list-item-icon-appoint";
				}
				content = '<div id="content"><div class="left_float"><span lang="en">Location</span>: '+location+' </div><div class="right_float"><span lang="en">Start Date</span>: '+due+' </div><br \\><div style="margin-left:46px"><span lang="en">Tags</span>: '+tags+'</div></div>';
				break;
			}
			html_code += '<div id="' + key + '" class="list-item ui-corner-all ui-widget-content"><div class="' + icon_style + '"/><h2>' + note.title + '</h2>'+content+'<div class="list-item-bgcolor" style="background-color:' + note.color + '"/></div>';
			content = "";
		}

		
		
		$('input#searchbox_input').val(searchstr);
		$('div#noteslist').empty();
		$(html_code).appendTo('div#noteslist');
		$("div#singlenoteview").hide();
		$("div#tagcloudview").hide();
		$("div#infopageview").hide();
		$("div#listview").show();
		$('#navbar_listview').show();
		$('#navbar_singlenoteview').hide();
		$('#navbar_tagcloudview').hide();
		$('#navbar_infopageview').hide();
		_setDynamicClickEvents();
	};

	/**
	 * Method to build up the view to show a single note in detail.
	 * The Data passed in the parameters is filled to the View
	 * Fields accordingly. Afterward the DetailedNotesView is shown,
	 * and all other views gets hided.
	 * @param {String-Array} pd data packed in String Array for display in view
	 * @param {String} id the is of the currently displayed note
	 */
	interFace.showDetailNotesView = function(pd,id) {
		debug('View showDetailNotesView(): write the interests data into DOM and show the div containing interests data');
		$("#tags_tagsinput").remove();
		var schema = "default";
		if('schema' in pd) {
			schema = pd.schema.toLowerCase();
		}

		// hidden fields
		$("input#id").val(id);
		$("input#schema").val(schema);

		// check first if type has to be set in current schema, if yes process, else ignore
		if(Controller.containsTypeField(schema, "title")) {
			$("#edit_title").show();
 			if (pd.title != null) {
				$("input#title").val(pd.title);
			} else {
				$("input#title").val("");
			}
		} else {
			$("#edit_title").hide();
		}

		if(Controller.containsTypeField(schema, "tags")) {
			$("#edit_tags").show();

			var tag_string = "";
			if (pd.tags != null) {
				for(i = 0; i < pd.tags.length; i++) {
					tag_string += pd.tags[i];
					if(i + 1 != pd.tags.length) {
						tag_string += ", ";
					}
				}
				tag_string += "";
			}

			$("input#tags").val(tag_string);

			$('input#tags').tagsInput({'height':'50px'});
		} else {
			$("#edit_tags").hide();
		}

		if(Controller.containsTypeField(schema, "content")) {
			$("#edit_content").show();
			if (pd.content != null) {
				$("textarea#description").val(pd.content);
			} else {
				$("textarea#description").val("");
			}
		} else {
			$("#edit_content").hide();
		}

		if(Controller.containsTypeField(schema, "location")) {
			$("#edit_location").show();
			if (pd.location != null) {
				$("input#location").val(pd.location);
			} else {
				$("input#location").val("");
			}
		} else {
			$("#edit_location").hide();
		}

		if(Controller.containsTypeField(schema, "date_start")) {
			$("#edit_date_start").show();
			if (pd.start_date != null) {
				$("input#start_date").val(pd.start_date);
			} else { 
				$("input#start_date").val(null);
			}
		} else {
			$("#edit_date_start").hide();
		}

		if(Controller.containsTypeField(schema, "date_end")) {
			$("#edit_date_end").show();
			if (pd.end_date != null) {
				$("input#end_date").val(pd.end_date);
			} else { 
				$("input#end_date").val(null);
			}
		} else {
			$("#edit_date_end").hide();
		}

		if(Controller.containsTypeField(schema, "reminder")) {
			$("#edit_reminder").show();
			if (pd.reminder != null) {
				$("input#reminder").val(pd.reminder);
				if (Controller.shouldReminderAlert(pd.reminder, 2)) {
					$("input#reminder").css({'background-color' : 'red', 'font-weight' : 'bolder', "color": "lightgrey"});
				} else {
					$("input#reminder").css({'background-color' : 'white', 'font-weight' : 'normal', "color": "black"});
				}
			} else {
				$("input#reminder").val(null);
			}
		} else {
			$("#edit_reminder").hide();
		}

		if(Controller.containsTypeField(schema, "color")) {
			$('div#color_div').show();
			$('div#color_div').children('.crayonbox').find('[title=' + pd.color + ']').trigger('click')
		} else {
			$('div#color_div').hide();
		}

		if(Controller.containsTypeField(schema, "progress")) {
			$('div#edit_progress').show();
			if (pd.progress != null) {
				$('div#slider_progress').slider( "option", "value", pd.progress );
			} else {
				$('div#slider_progress').slider( "option", "value", 0 );
			}
		} else {
			$('div#edit_progress').hide();
		}

		if(Controller.containsTypeField(schema, "priority")) {
			$('div#edit_priority').show();
			if (pd.priority != null) {
				$('div#slider_priority').slider( "option", "value", pd.priority );
			} else {
				$('div#slider_priority').slider( "option", "value", 0 );
			}
		} else {
			$('div#edit_priority').hide();
		}

        
		// hide all unneeded view
		$("div#listview").hide();
		$("div#infopageview").hide();
		$("div#tagcloudview").hide();
		$("div#tag_cloud_outside").hide();
		$("div#singlenoteview").show();
    	$('#navbar_listview').hide();
    	$('#navbar_singlenoteview').show();
    	$('#navbar_tagcloudview').hide();
    	$('#navbar_infopageview').hide();
        _setClickEvents();
	}

	/**
	 * Method to build up the view to show the tags in a tag cloud view.
	 * The Data passed in the parameters is filled to the View
	 * Fields accordingly. Afterward the TagCloudView is shown,
	 * and all other views gets hided.
	 * @param {String-Array} pd data packed in String Array containing the tags
	 */
	interFace.showTagCloudView = function(pd) {
		debug('View showTagCloudView: write the interests data into DOM and show the div containing interests data');

		$('div#tags').empty();
		var html_code = "";

		html_code = _createTagList("",pd);

		$(html_code).appendTo('div#tags');
		$("div#singlenoteview").hide();
		$("div#listview").hide();
		$("div#infopageview").hide();
		$("div#tagcloudview").show();
		$("input#title").val(pd.title);
		$('#navbar_listview').hide();
		$('#navbar_singlenoteview').hide();
		$('#navbar_tagcloudview').show();
		$('#navbar_infopageview').hide();

		_setDynamicTagClickEvents();
	};

	/**
	 * Method which generates the actual tag cloud view
	 * The Data passed in the parameters is filled to the View
	 * Fields accordingly. Afterward the TagCloudView is shown,
	 * and all other views gets hided.
	 * @param {String-Array} pd data packed in String Array containing the tags
	 */
    interFace.createTagCloud = function(pd) {
        debug('View createTagCloud: write the interests data into DOM and show the div containing interests data');
		$('div#tag_cloud').empty();
		var html_code = "";

		
       html_code = _createTagList('tag_list',pd);
		$(html_code).appendTo('div#tag_cloud');
        $("div#tag_cloud_outside").show();

		_setDynamicTagClickEvents();
    };

	/**
	 * Method which resets all input fields in DetailedNoteView for display as new Note View.
	 * The Data passed is used to identify the type of the new note.
	 * Afterward the DetailedNoteView is shown and all other views gets hided.
	 * @param {String} new_schema the definition of the note
	 */
    interFace.showAddNote = function(new_schema) {
		debug('View showDetailNotesView(): write the interests data into DOM and show the div containing interests data');
		var schema = new_schema.toLowerCase();
		if ($("#tags_tagsinput")) {
			$("#tags_tagsinput").remove();
		}
		// hidden fields
		$("input#id").val('');
		$("input#schema").val(schema);

		// reset all fields first
		if(Controller.containsTypeField(schema, "title")) {
			$("#edit_title").show();
			$("input#title").val("");
		} else {
			$("#edit_title").hide();
		}

		if(Controller.containsTypeField(schema, "tags")) {
			$("#edit_tags").show();
			var tag_string = "";
			$("input#tags").val(tag_string);

		$('input#tags').tagsInput({'height':'50px'});
		} else {
			$("#edit_tags").hide();
		}

		if(Controller.containsTypeField(schema, "content")) {
			$("#edit_content").show();
			$("textarea#description").val("");
		} else {
			$("#edit_content").hide();
		}

		if(Controller.containsTypeField(schema, "location")) {
			$("#edit_location").show();
			$("input#location").val("");
		} else {
			$("#edit_location").hide();
		}

		if(Controller.containsTypeField(schema, "date_start")) {
			$("#edit_date_start").show();
			$("input#start_date").val(null);
		} else {
			$("#edit_date_start").hide();
		}

		if(Controller.containsTypeField(schema, "date_end")) {
			$("#edit_date_end").show();
			$("input#end_date").val(null);
		} else {
			$("#edit_date_end").hide();
		}

		if(Controller.containsTypeField(schema, "reminder")) {
			$("#edit_reminder").show();
			$("input#reminder").val(null);
			$("input#reminder").css({'background-color' : 'white', 'font-weight' : 'normal', "color": "black"});
		} else {
			$("#edit_reminder").hide();
		}

		if(Controller.containsTypeField(schema, "color")) {
			$('div#color_div').show();
			$('div#color_div').children('.crayonbox').uncolor();
		} else {
			$('div#color_div').hide();
		}

		if(Controller.containsTypeField(schema, "progress")) {
			$('div#edit_progress').show();
			$('div#slider_progress').slider( "option", "value", 0 );
		} else {
			$('div#edit_progress').hide();
		}

		if(Controller.containsTypeField(schema, "priority")) {
			$('div#edit_priority').show();
			$('div#slider_priority').slider( "option", "value", 0 );
		} else {
			$('div#edit_priority').hide();
		}

        
		// hide all other views
		$("div#listview").hide();
		$("div#tagcloudview").hide();
		$("div#tag_cloud_outside").hide();
		$("div#infopageview").hide();
		$("div#singlenoteview").show();
		$('#navbar_listview').hide();
		$('#navbar_singlenoteview').show();
		$('#navbar_tagcloudview').hide();
		$('#navbar_infopageview').hide();
    };

	/**
	 * Method which just displays the static Information Page.
	 * Therefore all other views are hide and the InfoPage is shown.
	 */
	interFace.showInfoPageListView = function() {
		// hide all other views
		$("div#listview").hide();
		$("div#tagcloudview").hide();
		$("div#tag_cloud_outside").hide();
		$("div#singlenoteview").hide();
		$("div#infopageview").show();
		$('#navbar_listview').hide();
		$('#navbar_singlenoteview').hide();
		$('#navbar_tagcloudview').hide();
		$('#navbar_infopageview').show();
	};

	/**
	 * Method which clears the values of all the fields in the
	 * singleNoteView.
	 */
	interFace.clearSingeNoteView = function() {
		$("input#location").val("");
		$("textarea#description").val("");
		$("input#title").val("");
		$("input#schema").val("");
		$("input#start_date").val("");
		$("input#end_date").val("");
		$("input#reminder").val("");
	        $('div#color_div').children('.crayonbox').uncolor();
		$("input#tags").val(""); 
		this.clearTagsSingeNoteView();
		$('div#slider_progress').slider( "option", "value", 0 );
		$('div#slider_priority').slider( "option", "value", 0 );
		$("input#id").val('');
	};

	/**
	 * Method which clears the tags list in the
	 * singleNoteView.
	 */
	interFace.clearTagsSingeNoteView = function() {
		$("#tags_tagsinput").remove();
	};

	/**
	 * Method which return the current value of the id
	 * field at the SingleNoteView.
	 * @return {String} current value of the id field
	 */
	interFace.getSingleNoteViewId = function() {
		return $("input#id").val();
	};

	/**
	 * Method which return the current value of the schema
	 * field at the SingleNoteView.
	 * @return {String} current value of the schema field
	 */
	interFace.getSingleNoteViewSchema = function() {
		return $("input#schema").val();
	};

	/**
	 * Method which return the current value of the title
	 * field at the SingleNoteView.
	 * @return {String} current value of the title field
	 */
	interFace.getSingleNoteViewTitle = function() {
		return $("input#title").val();
	};

	/**
	 * Method which return the current value of the tags
	 * list at the SingleNoteView.
	 * @return {String-List} current list of the tags list
	 */
	interFace.getSingleNoteViewTags = function() {
		return document.getElementById('tags_tagsinput').getElementsByTagName('span');
	};

	/**
	 * Method which return the current value of the content
	 * field at the SingleNoteView.
	 * @return {String} current value of the content field
	 */
	interFace.getSingleNoteViewContent = function() {
		return $("textarea#description").val();
	};

	/**
	 * Method which return the current value of the location
	 * field at the SingleNoteView.
	 * @return {String} current value of the location field
	 */
	interFace.getSingleNoteViewLocation = function() {
		return $("input#location").val();
	};

	/**
	 * Method which return the current value of the start_date
	 * field at the SingleNoteView.
	 * @return {String} current value of the start_date field
	 */
	interFace.getSingleNoteViewStartDate = function() {
		return $("input#start_date").val();
	};

	/**
	 * Method which return the current value of the end_date
	 * field at the SingleNoteView.
	 * @return {String} current value of the end_date field
	 */
	interFace.getSingleNoteViewEndDate = function() {
		return $("input#end_date").val();
	};

	/**
	 * Method which return the current value of the color
	 * field at the SingleNoteView.
	 * @return {String} current value of the color field as hex string
	 */
	interFace.getSingleNoteViewColor = function() {
		return $("input#colorSelector").val();
	};

	/**
	 * Method which return the current value of the reminder
	 * field at the SingleNoteView.
	 * @return {String} current value of the reminder field
	 */
	interFace.getSingleNoteViewReminder = function() {
		return $("input#reminder").val();
	};

	/**
	 * Method which return the current value of the progress
	 * field at the SingleNoteView.
	 * @return {Integer} current value of the progress field
	 */
	interFace.getSingleNoteViewProgress = function() {
		return $('div#slider_progress').slider( "option", "value" );
	};

	/**
	 * Method which return the current value of the priority
	 * field at the SingleNoteView.
	 * @return {Integer} current value of the priority field
	 */
	interFace.getSingleNoteViewPriority = function() {
		return $('div#slider_priority').slider( "option", "value" );
	};
	
	/* end of public methods */
	

	/* private methods */

	/* variable to cache translation data */
    var _lang_data = null,
	
	/**
	 * Private method to create a tag string out of a list of tags.
	 * @param {String-Array} tags list of tags to add to string
	 * @param {Integer} number_tags number of tags to add to the string
	 */
    _createTagString = function (tags, number_tags) {
        var tag_string = "";
        if (tags != null) {
		    for(i = 0; i < tags.length; i++) {
			    tag_string += tags[i];
			    if(i + 1 != tags.length) {
				    tag_string += ", ";
			    }
                if (i == number_tags) {
                    tag_string += ", ...";
                    break;
                }
		    }
	    }
        return tag_string;
    },

	/**
	 * Private method to create a html-tag-list out of a list of tags.
	 * This is used by the tagCloud library.
	 * @param {String} id TagList identifier.
	 * @param {Array} pd holds the tag and the wheigtened number
	 */
    _createTagList = function(id,pd) {
        var html_code = "";
        if(pd) {
            if (id)
			    html_code += "<ul id='"+id+"'>";
            else
                html_code += "<ul>";
			var max = 0;
			for(var tag in pd) {
				var cnt = pd[tag];
				if(cnt > max) {
					max = cnt;
				}
			}

			var fac = 10 / max;
			for(var tag in pd) {
				var cnt_tmp = pd[tag];
				var cnt = Math.round(cnt_tmp * fac);
				html_code += '<li id="' + tag + '" class="tag' + cnt + '"><a href="#" onclick="return $(\'#tags\').addTag(\''+tag+'\');"">' + tag + '</a></li>';
			}
			html_code += "</ul>";
		}
        return html_code;
    },
	/* the function that translates the existing strings in DOM, if the translation for a string does not exist, the string is returned */
	_translateExistingStringsInDOM = function(lang) {
		$("* [lang='en']").each(function() {
			$(this).html(__($(this).html())).attr('lang', lang)
		});
	},
	
	/* function that should be called any time a string is appended into DOM to append the translated string */
	__ =  function(str) {
		return (_lang_data != null && typeof _lang_data[str] != 'undefined') ? _lang_data[str] : str;
	},

	_setClickEvents = function() {
  
		debug('View _setClickEvents(): set click event for #menu_refresh_list');
			$("#menu_refresh_list").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesListViewDataAsked();
		});

        debug('View _setClickEvents(): set click event for #menu_tag_cloud_view');
			$("#menu_tag_cloud_view").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.tagCloudViewDataAsked();
		});

        debug('View _setClickEvents(): set click event for #menu_about_view');
			$("#menu_about_view").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.infoPageViewDataAsked();
		});

        debug('View _setClickEvents(): set click event for #single_list_view');
			$("#single_list_view").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesReturnToListView();
		});

        debug('View _setClickEvents(): set click event for #single_delete_note');
			$("#single_delete_note").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesDeleteNote();
		});

        debug('View _setClickEvents(): set click event for #tag_refresh_tag_cloud');
			$("#tag_refresh_tag_cloud").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.tagCloudViewDataAsked();
		});

        debug('View _setClickEvents(): set click event for #tag_refresh_list');
			$("#tag_refresh_list").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesListViewDataAsked('');
		});

        debug('View _setClickEvents(): set click event for #info_list_view');
			$("#info_list_view").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesListViewDataAsked('');
		});

        debug('View _setClickEvents(): set click event for #single_tag_cloud_get_data');
			$("#single_tag_cloud_get_data").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.getTagCloudData();
		});

        debug('View _setClickEvents(): set click event for #add_note');
			$("#add_note").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesAddNewNote('note');
		});
    
        debug('View _setClickEvents(): set click event for #add_todo');
			$("#add_todo").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesAddNewNote('todo');
		});

        debug('View _setClickEvents(): set click event for #add_appointment');
			$("#add_appointment").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesAddNewNote('appointment');
		});

        debug('View _setClickEvents(): set click event for #search_list_view');
			$("#search_list_view").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesListViewDataAsked($('input#searchbox_input').val());
		});

	},

	_setDynamicClickEvents = function() {

		debug('View _setDynamicClickEvents(): set click event for #id');

		$('div#noteslist').children().each(function() {
       			$(this).click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesDetailViewDataAsked($(this).attr("id"));
			});
		});
	}; 

	_setDynamicTagClickEvents = function() {

		debug('View _setDynamicTagClickEvents(): set click event for #id');

		$('div#tags > ul').children().each(function() {
       			$(this).click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.tagCloudSelectedViewDataAsked($(this).attr("id"));
			});
		});
	}; 

	/* end of private methods */

    return interFace;
}(MVC.View || {}, MVC.Controller, jQuery));
