/**
 * MVC frame work
 * contains additional Helper modules that are used in framework
 */
var MVC = (function () { 
	var mvcObject = {
		Model: {},
		View: {},
		Controller: {},
		Helper: {}
	};
	
    return mvcObject; 
}());

/* Helper Modules */

/**
 * Helper module to process server requests, using jQuery interface
 * @param {Object} $
 */
MVC.Helper.ServerAPI = (function () { 
	var interFace = {
	
		/* public methods */

		/**
		 * Mapping Translation Request to webService XMLHttpRequest
		 * Therefore that this is just a mapper function,
		 * detailed description can be found at the
		 * corresponding Controller- and webService methods.
		 */
		getTranslations: function(lang, callback) {
			_sendRequest({}, callback, './locale/lang.'+lang);
		},
	
		/**
		 * Mapping getAllNotes Request to webService XMLHttpRequest
		 * Therefore that this is just a mapper function,
		 * detailed description can be found at the
		 * corresponding Controller- and webService methods.
		 */
		getAllNotes: function(searchString, callback) {
                        var url = widget.preferenceForKey('apiurl');
                        var apikey = widget.preferenceForKey('apikey');
                        url = url+'/v1.0/'+apikey+'/notes';
                        debug("Helper.ServerAPI getAllNotes: send a xhr request to fetch all notes from the web service");

                        _sendRequest("", callback, url);
                },

		/**
		 * Mapping getSingleNote Request to webService XMLHttpRequest
		 * Therefore that this is just a mapper function,
		 * detailed description can be found at the
		 * corresponding Controller- and webService methods.
		 */
		getSingleNote: function(note_id, callback) {
                        debug("Helper.ServerAPI getSingleNotes: send a xhr request to fetch a single notes from the web service");
                        var param = {
                                "notes_id":note_id,
                                "apikey": widget.preferenceForKey('apikey'),
                                "action":'getSingleNote'
                        }
                        _sendRequest(param, callback);
                },

		/**
		 * Mapping getTagsWeightened Request to webService XMLHttpRequest
		 * Therefore that this is just a mapper function,
		 * detailed description can be found at the
		 * corresponding Controller- and webService methods.
		 */
		getTagsWeightened: function(callback) {
                        debug("Helper.ServerAPI getTagsWeightened: send a xhr request to fetch all tags from the web service");
                        var param = {
                                "apikey": widget.preferenceForKey('apikey'),
                                "action":'getTagsWeightened'
                        }
                        _sendRequest(param, callback);
                },

		/**
		 * Mapping updateNote Request to webService XMLHttpRequest
		 * Therefore that this is just a mapper function,
		 * detailed description can be found at the
		 * corresponding Controller- and webService methods.
		 */
		updateNote: function(id, json_string,callback) {
                        debug("Helper.ServerAPI updateNote: send a xhr request to update the actual note");
                        var param = {
                            "uuid":id,
                            "json_note":json_string,
                            "apikey": widget.preferenceForKey('apikey'),
                            "action":'updateNote'
                        }
                        _sendRequest(param,callback);
		},

		/**
		 * Mapping deleteNote Request to webService XMLHttpRequest
		 * Therefore that this is just a mapper function,
		 * detailed description can be found at the
		 * corresponding Controller- and webService methods.
		 */
		deleteNote: function(id, callback) {
                       debug("Helper.ServerAPI deleteNote:: send a xhr request to delete a note"); 
                       var param = {
                                "uuid":id,
                                "apikey": widget.preferenceForKey('apikey'),
                                "action":"deleteNote"
                        }
                        _sendRequest(param,callback);
		}, 

		/**
		 * Mapping addAPIKey Request to webService XMLHttpRequest
		 * Therefore that this is just a mapper function,
		 * detailed description can be found at the
		 * corresponding Controller- and webService methods.
		 */
		addAPIKey: function(callback) {
                       debug("Helper.ServerAPI addAPIKey:: send a xhr request to delete a note"); 
                       var param = {
		                       		"action":"getUUID"
		                }
                        _sendRequest(param,callback);
		}
		
		/* end of public methods */
	},


	
	
	
	
	/* private methods */
	
	_SERVICE_URL = './webService/notes_api.php', 

	_sendRequest = function(parameter, callback, url){
		if(typeof url == 'undefined')
			url = _SERVICE_URL;
		
		widget.httpGetJSON(
			url, 
			parameter, 
			function(jsonData) {
				
				if(typeof jsonData.error != 'undefined') {
					debug('Server reported the following error while processing the request: ' + jsonData.error);
					MVC.View.notify('An error occurred: '+jsonData.error+' <br \/>Please try again!');
					return;
				}
				callback(jsonData);
			},
			function(xhr, textStatus, e) {
				debug('Request failed: ' + e);
				MVC.View.notify('An unexpected error occurred while trying to communicate with the server.');
			}
		);
	}; 
	
	/* end of private methods */
	
	debug('MVC loaded');
	return interFace;
}());
