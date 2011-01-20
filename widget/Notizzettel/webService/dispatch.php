<?php
//print_r($_SERVER);
//die();

#patch to support also not apache2 rewrite webservers (eg. TU-Graz)
#just give the restresource with the dispatch.php as endpoint
#http://www.restserver.org/dispatch.php/helloworld/asd/?var1=haha&var2=aa
if (!isset($_SERVER['REDIRECT_URL'])){
	$_SERVER['REDIRECT_URL']=$_SERVER['PATH_INFO'];
}

// load Tonic library
require_once './lib/tonic.php';

// load examples
require_once './helloworld/helloworld.php';

// handle request
$config = array();
$config['baseUri']="/dispatch.php";
$request = new Request();
$resource = $request->loadResource();
$response = $resource->exec($request);
$response->output();

?>
