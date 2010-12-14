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

		getTranslations: function(lang, callback) {
			_sendRequest({}, callback, './locale/lang.'+lang);
		}
		
		/* end of public methods */
	},
	
	
	
	
	/* private methods */
	
	_SERVICE_URL = './webService/....', 

	_sendRequest = function(parameter, callback, url){
		if(typeof url == 'undefined')
			url = _SERVICE_URL;
		
		widget.httpGetJSON(
			url, 
			parameter, 
			function(jsonData) {
				
				if(typeof jsonData.error != 'undefined') {
					debug('Server reported the following error while processing the request: ' + jsonData.error);
					MVC.View.notify('An error occurred: '+jsonData.error+' <br />Please try again!');
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