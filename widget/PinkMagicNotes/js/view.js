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
			
		});
	};
		
	/* end of public methods */
	
	interFace.showNotesListView = function(pd) {
		debug('View showUserInterestsData(): write the interests data into DOM and show the div containing interests data');
		var html_code = "";
		for(var i=0; i<pd.length; i++) {
			/* call __() function to append the translated strings to DOM */
			html_code += __(pd[i]) + ', ';
		}
		if(html_code != "")
			html_code = '<span>' +html_code.substr(0, html_code.length-2) +'</span>';
		
		$("div#listview").find('> p').html(html_code);
		$("div#listview").show();
	};

	
	
	
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

		debug('View _setClickEvents(): set click event for button#button_show_noteslistview');
			$("button#button_show_noteslistview").click(function() {
				debug('View Click Event triggered: notice the Controller that the user wants to see the Interests data');
				Controller.notesListViewAsked();
		});
	}; 

	/* end of private methods */

    return interFace;
}(MVC.View || {}, MVC.Controller, jQuery));
