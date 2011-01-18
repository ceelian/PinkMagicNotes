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
			html_code += '<div id="' + key + '" class="list-item ui-corner-all ui-widget-content"><div class="list-item-icon"/><h2>' + note.title + '</h2><div class="list-item-bgcolor" style="background-color:' + note.color + '"/></div>';
		}
		
		$('div#noteslist').empty();
		$(html_code).appendTo('div#noteslist');
		$("div#singlenoteview").hide();
		$("div#listview").show();
		_setDynamicClickEvents();
	};

	interFace.showDetailNotesView = function(pd) {
		debug('View showDetailNotesView(): write the interests data into DOM and show the div containing interests data');
		var html_code = "";

		$("input#title").val(pd.title);

		var tag_string = "{";
		for(i = 0; i < pd.tags.length; i++) {
			tag_string += pd.tags[i];
			if(i + 1 != pd.tags.length) {
				tag_string += ", ";
			}
		}
		tag_string += "}";

		$("input#tags").val(tag_string);
		$("textarea#description").val(pd.content);

		$("div#listview").hide();
		$("div#singlenoteview").show();
	};

    interFace.showAddNote = function() {

        debug('View showAddNote: display the form');
        $("input#tags").val("");
        $("input#title").val("");
        $("textarea#description").val("");
        $("div#listview").hide();
        $("div#singlenoteview").show();
    };
	
	/* end of public methods */
	
	
	/* private methods */

	/* variable to cache translation data */
    var _lang_data = null,
	
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

		debug('View _setClickEvents(): set click event for #id');

		$('div#noteslist').children().each(function() {
       			$(this).click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesDetailViewDataAsked($(this).attr("id"));
			});
		});
	}; 

	/* end of private methods */

    return interFace;
}(MVC.View || {}, MVC.Controller, jQuery));
