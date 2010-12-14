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