/**
 * Controller Module
 * @param {Object} interFace
 * @param {Object} Model
 * @param {Object} View
 * @param {Object} Request
 */
MVC.Controller = (function (interFace, Model, View, Request) {
	
	/* public methods */
    
	/**
	 * Init method, used to setup Controller
	 * @param {String} currently used locale used for translation
	 */
	interFace.init = function(language) {
		_init(language);
		this.notesListViewDataAsked('');
	}

	/**
	 * Method to request the overview of all notes as a list,
	 * the selection can be limited with a search string.
	 * The Method triggers a Request to the Webservice and
	 * triggers an updated of the View.
	 * @param {String} searchString search query to limit results
	 */
        interFace.notesListViewDataAsked = function(searchString) {
                debug('Controller notesListViewDataAsked: get notes from Servics and let View append it to the listview DOM');
		Request.getAllNotes(searchString,
			function(interestsJsonData) {
				debug("Controller notesListViewDataAsked: command the View to append the interests data into DOM.");
				View.showNotesListView(searchString, interestsJsonData);
			}
		);
        }
	
	/**
	 * Method to request a single note, used for the detailed view.
	 * The Method triggers a Request to the Webservice and
	 * triggers an updated of the DetailedNotes-View.
	 * @param {String} id the identifier for the requested Note
	 */
        interFace.notesDetailViewDataAsked = function(id) {
                debug('Controller notesDetailViewDataAsked: get notes from Servics and let View append it to DOM');
		Request.getSingleNote(id, 
			function(interestsJsonData) {
				debug("Controller notesDetailViewDataAsked: command the View to append the interests data into DOM.");
				View.showDetailNotesView(interestsJsonData,id);
			}
		);
        }
        
	/**
	 * Method to request a the overview of the tags weigthened by there occurence count
	 * and displayed in a tag cloud.
	 * The Method triggers a Request to the Webservice and
	 * triggers an updated of the TagCloud-View.
	 */
        interFace.tagCloudViewDataAsked = function() {
                debug('Controller tagCloudViewDataAsked: get notes from Servics and let View append it to the tagcloud DOM');
		Request.getTagsWeightened(
			function(interestsJsonData) {
				debug("Controller tagCloudViewDataAsked: command the View to append the interests data into DOM.");
				View.showTagCloudView(interestsJsonData);
			}
		);
        }

	/**
	 * Method to request a list of notes containing a tag. The Method
	 * gets called from the tagCloudView. If the user clicks on a tag in
	 * the tagcloud an query is generated and all notes with having the
	 * tag attached gets listed.
	 * The Method triggers a Request to the Webservice and
	 * triggers an updated of the NotesList-View.
	 * @param {String} tag the current tag to look up
	 */
        interFace.tagCloudSelectedViewDataAsked = function(tag) {
                debug('Controller tagCloudSelectedViewDataAsked: get notes from Servics and let View append it to the tagcloud DOM');
		Request.getAllNotes('tags:' + tag,
			function(interestsJsonData) {
				debug("Controller tagCloudSelectedViewDataAsked: command the View to append the interests data into DOM.");
				View.showNotesListView('tags: ' + tag, interestsJsonData);
			}
		);
        }

	/**
	 * Method to request the static Information Page.
	 * The Method just triggers an updated of the Info-Page.
	 */
        interFace.infoPageViewDataAsked = function() {
                debug('Controller infoPageViewDataAsked: get notes from Servics and let View append it to the tagcloud DOM');
		View.showInfoPageListView();
        }
	
	/**
	 * Method to request the screen to add the new node.
	 * All fields have to get cleared, before showing the view.
	 * @param {String} schema represents the type of the node, headed
         *    over by the view.
	 */
        interFace.notesAddNewNote = function(schema) {
                this.storeNote();
                debug('Controller notesAddNewNote: show form for adding a new note');
                View.showAddNote(schema);
        }

	/**
	 * Method which stores the currently edited/shown note and 
	 * requests the ListView afterwards from the view.
	 */
       interFace.notesReturnToListView = function() {
            this.storeNote();         
            this.notesListViewDataAsked('');
        }

	/**
	 * Method which stores the currently edited/shown note.
	 * Which fields gets respected are influenced by the
	 * schema of the specified note.
	 */
       interFace.storeNote = function() {
            
            var id = document.getElementById('id').value;
            var jsonObj = {};
            
            if (document.getElementById('title').value) {

		    var schema = "default";

            if (document.getElementById('schema').value) {
			    schema = $("input#schema").val();
		    }
		    // schema
                    jsonObj["schema"] = schema;

		    // title
		    if(this.containsTypeField(schema, "title")) {
                    	jsonObj["title"] = $("input#title").val();
		    }

		    // tags
		    if(this.containsTypeField(schema, "tags")) {
                    	var tags2 = document.getElementById('tags_tagsinput').getElementsByTagName('span');
                        var i = 0;
                        var tags = new Array();
                        while(oNode = tags2.item(i++)) {
                            tags.push(oNode.firstChild.nodeValue);
                        }
                        for (var i = 0; i<tags.length; i++)  {
                            tags[i]=tags[i].replace(/^\s+|\s+$/g,"");
                        } 
                    	jsonObj["tags"] = tags;
		    }

		    // content
		    if(this.containsTypeField(schema, "content")) {
                    	jsonObj["content"] = $("textarea#description").val();
		    }

		    // location
		    if(this.containsTypeField(schema, "location")) {
                    	jsonObj["location"] = $("input#location").val();
		    }

		    // start and end date
		    if(this.containsTypeField(schema, "date_start")) {
                    	jsonObj["start_date"] = $("input#start_date").val();
		    }
		    if(this.containsTypeField(schema, "date_end")) {
                    	jsonObj["end_date"] = $("input#end_date").val();
		    }

		    // color
		    if(this.containsTypeField(schema, "color")) {
                    	jsonObj["color"] = $("input#colorSelector").val();
		    }
		
		    // reminder
		    if(this.containsTypeField(schema, "reminder")) {
                    	jsonObj["reminder"] = $("input#reminder").val();
		    }

		    // progress
		    if(this.containsTypeField(schema, "progress")) {
			    jsonObj["progress"] = $('div#slider_progress').slider( "option", "value" );
		    }

		    // priority
		    if(this.containsTypeField(schema, "priority")) {
			    jsonObj["priority"] = $('div#slider_priority').slider( "option", "value" );
		    }

                json_string = JSON.stringify(jsonObj);
                //console.log(json_string);
                debug('Controller notesReturnToListView: saving note');
                Request.updateNote(id,json_string, function(interestsJsonData) {
                    debug('Controller notesReturnToListView: show list view');
                });
            }

		// clear all values after saveing

		View.clearSingeNoteView();

        }

	/**
	 * Method to request the deletion for the currently active/shown
	 * note at the view. The Request is sent to the webService and
	 * after completion an updated for the NotesListView is triggered.
	 */
     interFace.notesDeleteNote = function() {
		var id = document.getElementById('id').value;      
		$("#tags_tagsinput").remove();
		if(id) { //id != null && !isNaN(id)
			Request.deleteNote(id, function(interestsJsonData) {
			debug('Controller notesDeleteNote: note deleted');
            		});
		} else {
			debug('Controller notesDeleteNote: delete requested for unsaved note');
		}
		View.clearSingeNoteView();
		this.notesListViewDataAsked('');
     }

	/**
	 * Method to request a tag-cloud to get shown in the view.
	 * A Request to the webService is sent to retrieve all tags in a
	 * weightened form and afterwards the request-data is passed to
	 * the view, which updates correspondingly.
	 */
        interFace.getTagCloudData = function() {
                debug('Controller getTagCloudData: get notes from Servics and let View append it to the tagcloud DOM');
		Request.getTagsWeightened(
			function(interestsJsonData) {
				debug("Controller getTagCloudData: command the View to append the interests data into DOM.");
				View.createTagCloud(interestsJsonData);
			}
		);
        }
        
	/**
	 * Method to request a new api-key for the webService Data-Storage.
	 * A Request to the webService is sent to retrieve a new apikey, and
	 * afterwards this property is set to the Widget preferences.
	 */
        interFace.createAPIKey = function() {
            debug("Controller createAPIKey: send request for api-creation");
            var apikey="";
            Request.addAPIKey(function(interestsJsonData) {
                apikey = interestsJsonData.apikey;
                debug("Controller createAPIKey: new API key created");
            });
            
            this.setPersistentData('apikey', apikey);
	 }

    /**
	 * Method to set a default api-url if no url is given in the config file.
	 * In the config file, the new preference is being set.
	 */
        interFace.createAPIUrl = function() {
            debug("Controller createAPIUrl: set apiurl in the preferences");           
            this.setPersistentData('apiurl', './webService/api.php');
	 }

	/**
	 * Method to store an value to a specific key to the Widget Preferences.
	 * A Request to the webService is sent to retrieve a new apikey, and
	 * afterwards this property is set to the Widget preferences.
	 * @param {String} key identifier for the property
	 * @param {String} value data to be stored for an identifier
	 * \warning Update for use in TUGraz PLE
	 */
	interFace.setPersistentData = function(key, value) {
		debug('Controller setPersistentData: Beni please fix to set it in the live system');
		//TODO: FIXXME: widget.setPreferenceForKey(value,key);
	} 

	/**
	 * This method evaluates if the given field has to be shown
	 * in the currently used note-schema.
	 * @param {String} schema identifier for note type
	 * @param {String} field which field should be checked
	 * @return {Boolean} true if the field is used in the schema, false if not
	 */
	interFace.containsTypeField = function(schema, field) {
		var ret = false;

		switch(schema) {
		case "note":
			switch(field) {
			case "title":
			case "color":
			case "tags":
			case "content":
				ret = true;
				break;
			}
			break;
		case "todo":
			switch(field) {
			case "title":
			case "color":
			case "tags":
			case "content":
			case "progress":
			case "date_start":
			case "date_end":
			case "priority":
				ret = true;
				break;
			}
			break;
		case "appointment":
			switch(field) {
			case "title":
			case "color":
			case "tags":
			case "date_start":
			case "date_end":
			case "reminder":
			case "location":
			case "content":
				ret = true;
				break;
			}
			break;
		default:
			switch(field) {
			case "title":
			case "color":
			case "tags":
			case "content":
				ret = true;
				break;
			}
			break;
		}

		return ret;
	}

	
	/**
	 * This method evaluates if an alert should be shown for a reminder-date.
	 * The given p_date is checked against the current date and if there
	 * are less then days_until_alert left, the method return true.
	 * @param {String} p_date Pretty Date (MM/DD/YYYY) representing reminder date
	 * @param {Integer} days_unitl_alert days before p_date alert should start
	 * @return {Boolean} true if time for alert, false if not
	 */
	interFace.shouldReminderAlert = function(p_date, days_until_alert) {
		var date = getDateFromPrettyDate(p_date);
		var now = new Date();

		var diff = daysFromDate1UntilDate2(date, now);
		if ( diff <= days_until_alert || diff < 0) {
			return true;
		} else {
			return false;
		}
	}

	/* end of public methods */

	/* private methods */
    
	/**
	 * Private Method whichs calculates the difference between two
	 * dates in days.
	 * @param {Date} date_one date which is compared
	 * @param {Date} date_two date which is compared
	 * @return {Integer} days between date_one and date_two, < 0 if date_two is earlier than date_one
	 */
	var daysFromDate1UntilDate2 = function(date_one, date_two) {
		var difference = date_two - date_one;
		return Math.round(difference/(1000*60*60*24));
	}

	/**
	 * Private Method whichs calculates and creates a Date Object representing
	 * the date given at the parameter.
	 * @param {String} p_date Pretty Date (MM/DD/YYYY)
	 * @return {Date} Date Object representing date in p_date
	 */
	var getDateFromPrettyDate = function(p_date) {
		if(p_date != null) {
			var dmy = p_date.split('/');
			if(dmy.length == 3 && !isNaN(dmy[0]) && !isNaN(dmy[1]) && !isNaN(dmy[2])) {
				return new Date(dmy[2], dmy[0]-1, dmy[1]);
			}
		}
		return new Date(1970, 01, 01);
	}
	
	/**
	 * Private initialization Method of Controller which triggers an View Update.
	 * If lang is different from the default (en) one, the Translation
	 * system is initialized.
	 * @param {String} lang current sytem language
	 */
	var _init = function(lang) {
		if(lang != 'en') {
			Request.getTranslations(
			lang, 
			function(translations) {
				View.init(translations);
			});
		}
		else {
			View.init(null);
		}
    	};
	
	/* end of private methods */
	
    return interFace;
}(MVC.Controller || {}, MVC.Model, MVC.View, MVC.Helper.ServerAPI));
