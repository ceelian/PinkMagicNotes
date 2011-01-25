Before you roll the widget to the PLE please do the following:

- Ensure that PHP has the permission to create files in the "webService" Folder
  The Notes Datasets will be stored in that folder.
- For security purposes it is highly recommendet that no file in the "webService" Folder
  which has the scheme "*.json" can be directly viewed through the webserver. Use .htaccess
  to prevent this
- Make sure that the default value for apikey in the config.xml is empty! Otherwise all users
  will share the same dataset
- Ensure that you change the function "interFace.setPersistentData" in the controller.js so that
  it writes to the preference file (config.xml)


