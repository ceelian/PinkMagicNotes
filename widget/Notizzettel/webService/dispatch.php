<?php


//patch to support also not apache2 rewrite webservers (eg. TU-Graz)
//just give the restresource with the dispatch.php as endpoint
//http://www.restserver.org/dispatch.php/helloworld/asd/?var1=haha&var2=aa
if (!isset($_SERVER['REDIRECT_URL'])){
	$_SERVER['REDIRECT_URL']=$_SERVER['PATH_INFO'];
}
//*/

// load Tonic library
require_once './lib/tonic.php';

// load examples
require_once './helloworld/helloworld.php';

// define url mapping
$urls = array();
$urls['/helloworld/(?P<bla>.*)']=array('class' => 'HelloWorldResource');


// handle request
$request = new Request();
$resource = $request->loadResource($urls);
$response = $resource->exec($request);
$response->output();

?>
