/**
 * Controller Module
 * @param {Object} interFace
 * @param {Object} Model
 * @param {Object} View
 * @param {Object} Request
 */
MVC.Controller = (function (interFace, Model, View, Request) {
	
	/* public methods */
    
	interFace.init = function(language) {
		_init(language);
		this.notesListViewDataAsked('');
	};

        interFace.notesListViewDataAsked = function(searchString) {
                
                debug('Controller notesListViewDataAsked: get notes from Servics and let View append it to the listview DOM');
		Request.getAllNotes(searchString,
			function(interestsJsonData) {
				debug("Controller notesListViewDataAsked: command the View to append the interests data into DOM.");
				View.showNotesListView(searchString, interestsJsonData);
			}
		);
        };
	
        interFace.notesDetailViewDataAsked = function(id) {
                debug('Controller notesDetailViewDataAsked: get notes from Servics and let View append it to DOM');
		Request.getSingleNote(id, 
			function(interestsJsonData) {
				debug("Controller notesDetailViewDataAsked: command the View to append the interests data into DOM.");
				View.showDetailNotesView(interestsJsonData,id);
			}
		);
        };
        
        interFace.tagCloudViewDataAsked = function() {
                debug('Controller tagCloudViewDataAsked: get notes from Servics and let View append it to the tagcloud DOM');
		Request.getTagsWeightened(
			function(interestsJsonData) {
				debug("Controller tagCloudViewDataAsked: command the View to append the interests data into DOM.");
				View.showTagCloudView(interestsJsonData);
			}
		);
        };

        interFace.tagCloudSelectedViewDataAsked = function(tag) {
                debug('Controller tagCloudViewDataAsked: get notes from Servics and let View append it to the tagcloud DOM');
		Request.getAllNotes('tags:' + tag,
			function(interestsJsonData) {
				debug("Controller tagCloudViewDataAsked: command the View to append the interests data into DOM.");
				View.showNotesListView('tags: ' + tag, interestsJsonData);
			}
		);
        };

        interFace.infoPageViewDataAsked = function() {
                debug('Controller infoPageViewDataAsked: get notes from Servics and let View append it to the tagcloud DOM');
		View.showInfoPageListView();
        };
	
        interFace.notesAddNewNote = function(schema) {
            
            document.getElementById('schema').value = schema;
		$('div#slider_progress').slider( "option", "value", 0 );
		$('div#slider_priority').slider( "option", "value", 0 );
            document.getElementById('location').value = "";
            document.getElementById('description').value = "";
	    $('div#color_div').children('.crayonbox').uncolor();
            document.getElementById('title').value = "";
            document.getElementById('start_date').value = "";
            document.getElementById('end_date').value = "";
            document.getElementById('reminder').value = "";
            $("#tags_tagsinput").remove();
            document.getElementById('id').value="";
            debug('Controller notesAddNewNote: show form for adding a new note');
            View.showAddNote(schema);
        };

       interFace.notesReturnToListView = function() {
            

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
                console.log(json_string);
                debug('Controller notesReturnToListView: saving note');
                Request.updateNote(id,json_string, function(interestsJsonData) {
                    debug('Controller notesReturnToListView: show list view');
                });
            }

            $("input#location").val("");
            $("textarea#description").val("");
            $("input#title").val("");
            $("input#schema").val("");
            $("input#start_date").val("");
            $("input#end_date").val("");
            $("input#reminder").val("");
	        $('div#color_div').children('.crayonbox').uncolor();
            $("input#tags").val(""); 
            $("#tags_tagsinput").remove();
		    $('div#slider_progress').slider( "option", "value", 0 );
		    $('div#slider_priority').slider( "option", "value", 0 );

            document.getElementById('id').value="";
            this.notesListViewDataAsked('');
        }

        interFace.notesDeleteNote = function() {
            var id = document.getElementById('id').value;
            Request.deleteNote(id, function(interestsJsonData) {
                debug('Controller notesDeleteNote: note deleted');
            });
            this.notesListViewDataAsked('');
        }

        interFace.getTagCloudData = function() {
                debug('Controller getTagCloudData: get notes from Servics and let View append it to the tagcloud DOM');
		Request.getTagsWeightened(
			function(interestsJsonData) {
				debug("Controller getTagCloudData: command the View to append the interests data into DOM.");
				View.createTagCloud(interestsJsonData);
			}
		);
        };

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

	
	// p_date: pretty date = MM/DD/YYYY
	// days_until_alert: days before p_date alter should be true
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

	var daysFromDate1UntilDate2 = function(date_one, date_two) {
		var difference = date_two - date_one;
		return Math.round(difference/(1000*60*60*24));
	}

	// pretty date = MM/DD/YYYY
	var getDateFromPrettyDate = function(p_date) {
		if(p_date != null) {
			var dmy = p_date.split('/');
			if(dmy.length == 3 && !isNaN(dmy[0]) && !isNaN(dmy[1]) && !isNaN(dmy[2])) {
				return new Date(dmy[2], dmy[0]-1, dmy[1]);
			}
		}
		return new Date(1970, 01, 01);
	}

	/* end of public methods */
	
	
	/* private methods */
    
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
