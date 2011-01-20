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
		this.notesListViewDataAsked();
	};

        interFace.notesListViewDataAsked = function() {
                debug('Controller notesListViewDataAsked: get notes from Servics and let View append it to the listview DOM');
		Request.getAllNotes(
			function(interestsJsonData) {
				debug("Controller notesListViewDataAsked: command the View to append the interests data into DOM.");
				View.showNotesListView(interestsJsonData);
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
		Request.getNotesForTag(tag,
			function(interestsJsonData) {
				debug("Controller tagCloudViewDataAsked: command the View to append the interests data into DOM.");
				View.showNotesListView(interestsJsonData);
			}
		);
        };
	
        interFace.notesAddNewNote = function() {

            document.getElementById('location').value = "";
            document.getElementById('description').value = "";
	    $('div#color_div').children('.crayonbox').uncolor();
            document.getElementById('title').value = "";
            document.getElementById('start_date').value = "";
            document.getElementById('end_date').value = "";
            document.getElementById('reminder').value = "";
            document.getElementById('tags').value = "";
            document.getElementById('id').value="";
            debug('Controller notesAddNewNote: show form for adding a new note');
            View.showAddNote();
        };

       interFace.notesReturnToListView = function() {
            var id = document.getElementById('id').value;
            var jsonObj = {};
            jsonObj["location"] = document.getElementById('location').value;
            jsonObj["content"] = document.getElementById('description').value;
            jsonObj["color"] = document.getElementById('colorSelector').value;
            jsonObj["title"] = document.getElementById('title').value;
            jsonObj["start_date"] = document.getElementById('start_date').value;
            jsonObj["end_date"] = document.getElementById('end_date').value;
            jsonObj["reminder"] = document.getElementById('reminder').value;
            var tags =  document.getElementById('tags').value;  
            tags = tags.split(','); 
            tags[0] = tags[0].substr(1);
            tags[tags.length-1] = tags[tags.length-1].substr(0,tags[tags.length-1].length-1);
            
            for (var i = 0; i<tags.length; i++)  {
                tags[i]=tags[i].replace(/^\s+|\s+$/g,"");
            }    
            jsonObj["tags"] = tags;
            console.log(jsonObj["tags"]);
            console.log(document.getElementById('tags').value);
            json_string = JSON.stringify(jsonObj);
            console.log(json_string);
            debug('Controller notesReturnToListView: saving note');
            Request.updateNote(id,json_string, function(interestsJsonData) {
                debug('Controller notesReturnToListView: show list view');
                

            });
            document.getElementById('location').value = "";
            document.getElementById('description').value = "";
	    $('div#color_div').children('.crayonbox').uncolor();
            document.getElementById('title').value = "";
            document.getElementById('start_date').value = "";
            document.getElementById('end_date').value = "";
            document.getElementById('reminder').value = "";
            document.getElementById('tags').value = "";
            document.getElementById('id').value="";
            this.notesListViewDataAsked();
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
