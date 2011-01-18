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
				View.showDetailNotesView(interestsJsonData);
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
	
        interFace.notesAddNewNote = function() {

            debug('Controller notesAddNewNote: show form for adding a new note');
            View.showAddNote();
        };
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
