<?php

/**
 * The Hello World of Tonic
 *
 * This example outputs a simple hello world message and the details of the
 * request and response as generated by Tonic. It also demonstrates etags and
 * "if none match" functionality.
 *
 */
class HelloWorldResource extends Resource {
    
	
    /**
     * Handle a GET request for this resource
     * @param Request request
     * @return Response
     */
    function get($request) {
        
        $response = new Response($request);
        $response->code = Response::OK;
        $response->addHeader('Content-type', 'text/plain');
        /*$response->body = print_r($_GET, 1);
        foreach ($request->negotiatedUris as $uri) {
             $response->body .= $uri."\n";
        }*/
        //$response->body .= $request->__toString();
		//$response->body .= $request->uris[0];
		//$response->body .= $request->uri;
			           
		
		$response->body .= $this->parameters['bla'];
        return $response;
        
    }

    
    
}

?>
