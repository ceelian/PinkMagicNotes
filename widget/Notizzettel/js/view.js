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
		
	interFace.showNotesListView = function(pd) {
		debug('View showUserInterestsData(): write the interests data into DOM and show the div containing interests data');
		var html_code = "";
		for(var key in pd.notes) {
			var note = pd.notes[key];
			var icon_style = "list-item-icon-dflt";

			switch(note.type) {
			case "note":
				icon_style ="list-item-icon-note";
				break;
			case "todo":
				icon_style ="list-item-icon-todo";
				break;
			case "appointment":
				icon_style ="list-item-icon-appoint";
				break;
			}
			html_code += '<div id="' + key + '" class="list-item ui-corner-all ui-widget-content"><div class="' + icon_style + '"/><h2>' + note.title + '</h2><div class="list-item-bgcolor" style="background-color:' + note.color + '"/></div>';
		}
		
		$('div#noteslist').empty();
		$(html_code).appendTo('div#noteslist');
		$("div#singlenoteview").hide();
		$("div#tagcloudview").hide();
		$("div#listview").show();
		_setDynamicClickEvents();
	};

	interFace.showDetailNotesView = function(pd,id) {
		debug('View showDetailNotesView(): write the interests data into DOM and show the div containing interests data');
		var type = "default";
		if('type' in pd) {
			type = pd.type.toLowerCase();
		}

		// hidden fields
		$("input#id").val(id);
		$("input#type").val(type);

		if(Controller.containsTypeField(type, "title")) {
			$("#edit_title").show();
 			if (pd.title != null) {
				$("input#title").val(pd.title);
			} else {
				$("input#title").val("");
			}
		} else {
			$("#edit_title").hide();
		}

		if(Controller.containsTypeField(type, "tags")) {
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
		} else {
			$("#edit_tgas").hide();
		}

		if(Controller.containsTypeField(type, "content")) {
			$("#edit_content").show();
			if (pd.content != null) {
				$("textarea#description").val(pd.content);
			} else {
				$("textarea#description").val("");
			}
		} else {
			$("#edit_content").hide();
		}

		if(Controller.containsTypeField(type, "location")) {
			$("#edit_location").show();
			if (pd.location != null) {
				$("input#location").val(pd.location);
			} else {
				$("input#location").val("");
			}
		} else {
			$("#edit_location").hide();
		}

		if(Controller.containsTypeField(type, "date_start")) {
			$("#edit_date_start").show();
			if (pd.start_date != null) {
				$("input#start_date").val(pd.start_date);
			} else { 
				$("input#start_date").val(null);
			}
		} else {
			$("#edit_date_start").hide();
		}

		if(Controller.containsTypeField(type, "date_end")) {
			$("#edit_date_end").show();
			if (pd.end_date != null) {
				$("input#end_date").val(pd.end_date);
			} else { 
				$("input#end_date").val(null);
			}
		} else {
			$("#edit_date_end").hide();
		}

		if(Controller.containsTypeField(type, "reminder")) {
			$("#edit_reminder").show();
			if (pd.reminder != null) {
				$("input#reminder").val(pd.reminder);
			} else {
				$("input#reminder").val(null);
			}
		} else {
			$("#edit_reminder").hide();
		}

		if(Controller.containsTypeField(type, "color")) {
			$('div#color_div').show();
			$('div#color_div').children('.crayonbox').find('[title=' + pd.color + ']').trigger('click')
		} else {
			$('div#color_div').hide();
		}

		if(Controller.containsTypeField(type, "progress")) {
			$('div#edit_progress').show();
			if (pd.progress != null) {
				$('div#slider_progress').slider( "option", "value", pd.progress );
			} else {
				$('div#slider_progress').slider( "option", "value", 0 );
			}
		} else {
			$('div#edit_progress').hide();
		}

		if(Controller.containsTypeField(type, "priority")) {
			$('div#edit_priority').show();
			if (pd.priority != null) {
				$('div#slider_priority').slider( "option", "value", pd.priority );
			} else {
				$('div#slider_priority').slider( "option", "value", 0 );
			}
		} else {
			$('div#edit_priority').hide();
		}

		$("div#listview").hide();
		$("div#tagcloudview").hide();
		$("div#tag_cloud_outside").hide();
		$("div#singlenoteview").show();
	}

	interFace.showTagCloudView = function(pd) {
		debug('View showTagCloudView: write the interests data into DOM and show the div containing interests data');

		$('div#tags').empty();
		var html_code = "";

		html_code = _createTagList("",pd);

		$(html_code).appendTo('div#tags');
		$("div#singlenoteview").hide();
		$("div#listview").hide();
		$("div#tagcloudview").show();
		$("input#title").val(pd.title);

		_setDynamicTagClickEvents();
	};

    interFace.createTagCloud = function(pd) {
        debug('View createTagCloud: write the interests data into DOM and show the div containing interests data');
		$('div#tag_cloud').empty();
		var html_code = "";

		
       html_code = _createTagList('tag_list',pd);
		$(html_code).appendTo('div#tag_cloud');
        $("div#tag_cloud_outside").show();

		_setDynamicTagClickEvents();
    };

    interFace.showAddNote = function() {

        debug('View showAddNote: display the form');
        $("input#tags").val("");
        $("input#title").val("");
        $("textarea#description").val("");
        $("div#listview").hide();
        $("div#tagcloudview").hide();
        $("div#singlenoteview").show();
        $("div#tag_cloud_outside").hide();
    };
	
	/* end of public methods */
	

	/* private methods */

	/* variable to cache translation data */
    var _lang_data = null,
	

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
				html_code += '<li id="' + tag + '" class="tag' + cnt + '"><a href="#" onclick="appendTagToField(\''+tag+'\');">' + tag + '</a></li>';
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

//		debug('View _setClickEvents(): set click event for button#button_show_noteslistview');
//			$("button#button_show_noteslistview").click(function() {
//				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
//				Controller.notesListViewDataAsked();
//		});
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

		//$('div#tags').ul').children().each(function() {
		$('div#tags > ul').children().each(function() {
       			$(this).click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				debug($(this));
				Controller.tagCloudSelectedViewDataAsked($(this).attr("id"));
			});
		});
	}; 

	/* end of private methods */

    return interFace;
}(MVC.View || {}, MVC.Controller, jQuery));
