<?php

// === SETTINGS ================================================================


// === SETTINGS END ============================================================
// Do not alter stuff below unless you know what you are doing
// =============================================================================

//=== PREPERATION ==============================================================
//patch to support also not apache2 rewrite webservers (eg. TU-Graz)
//just give the restresource with the dispatch.php as endpoint
//http://www.restserver.org/dispatch.php/helloworld/asd/?var1=haha&var2=aa

if (strpos($_SERVER['PATH_INFO'],$_SERVER['SCRIPT_NAME'])=== 0){
	$_SERVER['PATH_INFO']=substr_replace($_SERVER['PATH_INFO'], '',0, strlen($_SERVER['SCRIPT_NAME']));
}


if (!isset($_SERVER['REDIRECT_URL'])){
	$_SERVER['REDIRECT_URL']=$_SERVER['PATH_INFO'];
}


//=== TONIC LIBRARY ============================================================
// load Tonic library

class Logger {
  
    public static $logfile_path = 'log.txt';
    
    public static function log($msg) {
        if( $fh = @fopen(Logger::$logfile_path, "a+" ) ) {
            fwrite($fh, '['.date('d-m-Y H:i:s').'] '.$msg."\n");
            fclose($fh);
            return( true );
        } else {
            return( false );
        }
    }

}

/**
 * Model the data of the incoming HTTP request
 * @namespace Tonic\Lib
 */
class Request {

    /**
     * The requested URI
     * @var str
     */
    public $uri;

    /**
     * The URI where the front controller is positioned in the server URI-space
     * @var str
     */
    public $baseUri = '';

    /**
     * Array of possible URIs based upon accept and accept-language request headers in order of preference
     * @var str[]
     */
    public $negotiatedUris = array();

    /**
     * Array of possible URIs based upon accept request headers in order of preference
     * @var str[]
     */
    public $formatNegotiatedUris = array();

    /**
     * Array of possible URIs based upon accept-language request headers in order of preference
     * @var str[]
     */
    public $languageNegotiatedUris = array();

    /**
     * Array of accept headers in order of preference
     * @var str[][]
     */
    public $accept = array();

    /**
     * Array of accept-language headers in order of preference
     * @var str[][]
     */
    public $acceptLang = array();

    /**
     * Array of accept-encoding headers in order of preference
     * @var str[]
     */
    public $acceptEncoding = array();

    /**
     * Map of file/URI extensions to mimetypes
     * @var str[]
     */
    public $mimetypes = array(
            'html' => 'text/html',
            'txt' => 'text/plain',
            'php' => 'application/php',
            'css' => 'text/css',
            'js' => 'application/javascript',
            'json' => 'application/json',
            'xml' => 'text/xml',
            'rss' => 'application/rss+xml',
            'atom' => 'application/atom+xml',
            'gz' => 'application/x-gzip',
            'tar' => 'application/x-tar',
            'zip' => 'application/zip',
            'gif' => 'image/gif',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'ico' => 'image/x-icon',
            'swf' => 'application/x-shockwave-flash',
            'flv' => 'video/x-flv',
            'avi' => 'video/mpeg',
            'mpeg' => 'video/mpeg',
            'mpg' => 'video/mpeg',
            'mov' => 'video/quicktime',
            'mp3' => 'audio/mpeg'
        );

    /**
     * HTTP request method of incoming request
     * @var str
     */
    public $method = 'GET';

    /**
     * Body data of incoming request
     * @var str
     */
    public $data;

    /**
     * Array of if-match etags
     * @var str[]
     */
    public $ifMatch = array();

    /**
     * Array of if-none-match etags
     * @var str[]
     */
    public $ifNoneMatch = array();

    /**
     * Name of resource class to use for when nothing is found
     * @var str
     */
    public $noResource = 'NoResource';

    /**
     * A list of URL to namespace/package mappings for routing requests to a
     * group of resources that are wired into a different URL-space
     * @var str[]
     */
    public $mounts = array();

    /**
     * Set a default configuration option
     */
    private function getConfig($config, $configVar, $serverVar = NULL, $default = NULL) {
        if (isset($config[$configVar])) {
            return $config[$configVar];
        } elseif (isset($_SERVER[$serverVar]) && $_SERVER[$serverVar] != '') {
            return $_SERVER[$serverVar];
        } else {
            return $default;
        }
    }

    /**
     * Create a request object using the given configuration options.
     *
     * The configuration options array can contain the following:
     *
     * <dl>
     * <dt>uri</dt> <dd>The URI of the request</dd>
     * <dt>method</dt> <dd>The HTTP method of the request</dd>
     * <dt>data</dt> <dd>The body data of the request</dd>
     * <dt>accept</dt> <dd>An accept header</dd>
     * <dt>acceptLang</dt> <dd>An accept-language header</dd>
     * <dt>acceptEncoding</dt> <dd>An accept-encoding header</dd>
     * <dt>ifMatch</dt> <dd>An if-match header</dd>
     * <dt>ifNoneMatch</dt> <dd>An if-none-match header</dd>
     * <dt>mimetypes</dt> <dd>A map of file/URI extenstions to mimetypes, these
     * will be added to the default map of mimetypes</dd>
     * <dt>baseUri</dt> <dd>The base relative URI to use when dispatcher isn't
     * at the root of the domain. Do not put a trailing slash</dd>
     * <dt>404</dt> <dd>Class name to use when no resource is found</dd>
     * <dt>mounts</dt> <dd>an array of namespace to baseUri prefix mappings</dd>
     * </dl>
     *
     * @param mixed[] config Configuration options
     */
    function __construct($config = array()) {

        // set defaults
        $config['uri'] = $this->getConfig($config, 'uri', 'REDIRECT_URL');
        $config['baseUri'] = $this->getConfig($config, 'baseUri', '');
        $config['accept'] = $this->getConfig($config, 'accept', 'HTTP_ACCEPT');
        $config['acceptLang'] = $this->getConfig($config, 'acceptLang', 'HTTP_ACCEPT_LANGUAGE');
        $config['acceptEncoding'] = $this->getConfig($config, 'acceptEncoding', 'HTTP_ACCEPT_ENCODING');
        $config['ifMatch'] = $this->getConfig($config, 'ifMatch', 'HTTP_IF_MATCH');
        $config['ifNoneMatch'] = $this->getConfig($config, 'ifNoneMatch', 'HTTP_IF_NONE_MATCH');

        if (isset($config['mimetypes']) && is_array($config['mimetypes'])) {
            foreach ($config['mimetypes'] as $ext => $mimetype) {
                $this->mimetypes[$ext] = $mimetype;
            }
        }

        // set baseUri
        $this->baseUri = $config['baseUri'];

        // get request URI
        $parts = explode('/', $config['uri']);
        $lastPart = array_pop($parts);
        $this->uri = join('/', $parts);

        $parts = explode('.', $lastPart);
        $this->uri .= '/'.$parts[0];

        if (substr($this->uri, -1, 1) == '/') { // remove trailing slash problem
            $this->uri = substr($this->uri, 0, -1);
        }

        array_shift($parts);
        foreach ($parts as $part) {
            $this->accept[10][] = $part;
            $this->acceptLang[10][] = $part;
        }

        // sort accept headers
        $accept = explode(',', strtolower($config['accept']));
        foreach ($accept as $mimetype) {
            $parts = explode(';q=', $mimetype);
            if (isset($parts) && isset($parts[1]) && $parts[1]) {
                $num = $parts[1] * 10;
            } else {
                $num = 10;
            }
            $key = array_search($parts[0], $this->mimetypes);
            if ($key) {
                $this->accept[$num][] = $key;
            }
        }
        krsort($this->accept);

        // sort lang accept headers
        $accept = explode(',', strtolower($config['acceptLang']));
        foreach ($accept as $mimetype) {
            $parts = explode(';q=', $mimetype);
            if (isset($parts) && isset($parts[1]) && $parts[1]) {
                $num = $parts[1] * 10;
            } else {
                $num = 10;
            }
            $this->acceptLang[$num][] = $parts[0];
        }
        krsort($this->acceptLang);

        // get encoding accept headers
        if ($config['acceptEncoding']) {
            foreach (explode(',', $config['acceptEncoding']) as $key => $accept) {
                $this->acceptEncoding[$key] = trim($accept);
            }
        }

        // create negotiated URI lists from accept headers and request URI
        foreach ($this->accept as $typeOrder) {
            foreach ($typeOrder as $type) {
                if ($type) {
                    foreach ($this->acceptLang as $langOrder) {
                        foreach ($langOrder as $lang) {
                            if ($lang && $lang != $type) {
                                $this->negotiatedUris[] = $this->uri.'.'.$type.'.'.$lang;
                            }
                        }
                    }
                    $this->negotiatedUris[] = $this->uri.'.'.$type;
                    $this->formatNegotiatedUris[] = $this->uri.'.'.$type;
                }
            }
        }
        foreach ($this->acceptLang as $langOrder) {
            foreach ($langOrder as $lang) {
                if ($lang) {
                    $this->negotiatedUris[] = $this->uri.'.'.$lang;
                    $this->languageNegotiatedUris[] = $this->uri.'.'.$lang;
                }
            }
        }
        $this->negotiatedUris[] = $this->uri;
        $this->formatNegotiatedUris[] = $this->uri;
        $this->languageNegotiatedUris[] = $this->uri;

        $this->negotiatedUris = array_values(array_unique($this->negotiatedUris));
        $this->formatNegotiatedUris = array_values(array_unique($this->formatNegotiatedUris));
        $this->languageNegotiatedUris = array_values(array_unique($this->languageNegotiatedUris));

        // get HTTP method
        $this->method = strtoupper($this->getConfig($config, 'method', 'REQUEST_METHOD', $this->method));

        // get HTTP request data
        $this->data = $this->getConfig($config, 'data', NULL, file_get_contents("php://input"));

        // conditional requests
        if ($config['ifMatch']) {
            $ifMatch = explode(',', $config['ifMatch']);
            foreach ($ifMatch as $etag) {
                $this->ifMatch[] = trim($etag, '" ');
            }
        }
        if ($config['ifNoneMatch']) {
            $ifNoneMatch = explode(',', $config['ifNoneMatch']);
            foreach ($ifNoneMatch as $etag) {
                $this->ifNoneMatch[] = trim($etag, '" ');
            }
        }

        // 404 resource
        if (isset($config['404'])) {
            $this->noResource = $config['404'];
        }

        // mounts
        if (isset($config['mount']) && is_array($config['mount'])) {
            $this->mounts = $config['mount'];
        }

        // resource classes
        foreach (get_declared_classes() as $className) {
            if (is_subclass_of($className, 'Resource')) {

                $resourceReflector = new ReflectionClass($className);
                $comment = $resourceReflector->getDocComment();

                $className = $resourceReflector->getName();
                if (method_exists($resourceReflector, 'getNamespaceName')) {
                    $namespaceName = $resourceReflector->getNamespaceName();
                } else {
                    $namespaceName = FALSE;
                }

                if (!$namespaceName) {
                    preg_match('/@(?:package|namespace)\s+([^\s]+)/', $comment, $package);
                    if (isset($package[1])) {
                        $namespaceName = $package[1];
                    }
                }

                preg_match_all('/@uri\s+([^\s]+)(?:\s([0-9]+))?/', $comment, $annotations);
                if (isset($annotations[1])) {

                    $uris = $annotations[1];
                } else {
                    $uris = array('/');
                }

                // adjust URI for mountpoint
                if (isset($this->mounts[$namespaceName])) {
                    $mountPoint = $this->mounts[$namespaceName];
                } else {
                    $mountPoint = '';
                }



            }
        }

    }

    /**
     * Convert the object into a string suitable for printing
     * @return str
     */
    function __toString() {
        $str = 'URI: '.$this->uri."\n";
        $str .= 'Method: '.$this->method."\n";
        if ($this->data) {
            $str .= 'Data: '.$this->data."\n";
        }
        $str .= 'Negotated URIs:'."\n";
        foreach ($this->negotiatedUris as $uri) {
            $str .= "\t".$uri."\n";
        }
        $str .= 'Format Negotated URIs:'."\n";
        foreach ($this->formatNegotiatedUris as $uri) {
            $str .= "\t".$uri."\n";
        }
        $str .= 'Language Negotated URIs:'."\n";
        foreach ($this->languageNegotiatedUris as $uri) {
            $str .= "\t".$uri."\n";
        }
        if ($this->ifMatch) {
            $str .= 'If Match:';
            foreach ($this->ifMatch as $etag) {
                $str .= ' '.$etag;
            }
            $str .= "\n";
        }
        if ($this->ifNoneMatch) {
            $str .= 'If None Match:';
            foreach ($this->ifNoneMatch as $etag) {
                $str .= ' '.$etag;
            }
            $str .= "\n";
        }

        return $str;
    }

    /**
     * Instantiate the resource class that matches the request URI the best
     * @return Resource
     */
    function loadResource($urls) {

        $uriMatches = array();
       
        foreach ($urls as $uri => $resource) {
               $regex = '#^'.$this->baseUri.$uri.'$#';
            
	    if (preg_match($regex, $this->uri, $matches)) {
                
                array_shift($matches);
		$resource['priority'] = 0;
                $uriMatches[$resource['priority']] = array(
                    $resource['class'],
                    $matches
                );
            }
        }

        
        ksort($uriMatches);

        if ($uriMatches) {
            $resourceDetails = array_shift($uriMatches);
            return new $resourceDetails[0]($resourceDetails[1]);
        }
        return new $this->noResource();

    }

    /**
     * Check if an etag matches the requests if-match header
     * @param str etag Etag to match
     * @return bool
     */
    function ifMatch($etag) {
        if (isset($this->ifMatch[0]) && $this->ifMatch[0] == '*') {
            return TRUE;
        }
        return in_array($etag, $this->ifMatch);
    }

    /**
     * Check if an etag matches the requests if-none-match header
     * @param str etag Etag to match
     * @return bool
     */
    function ifNoneMatch($etag) {
        if (isset($this->ifMatch[0]) && $this->ifMatch[0] == '*') {
            return FALSE;
        }
        return in_array($etag, $this->ifNoneMatch);
    }


}

/**
 * Base resource class
 * @namespace Tonic\Lib
 */
class Resource {

    protected $parameters = array();

    /**
     * Resource constructor
     * @param str[] parameters Parameters passed in from the URL as matched from the URI regex
     */
    function  __construct($parameters = array()) {
		$this->parameters = $parameters;
    }

    /**
     * Execute a request on this resource.
     * @param Request request
     * @return Response
     */
    function exec($request) {

        if (method_exists($this, $request->method)) {

            $parameters = $this->parameters;
            array_unshift($parameters, $request);

            $response = call_user_func_array(
                array($this, $request->method),
                $parameters
            );

        } else {

            // send 405 method not allowed
            $response = new Response($request);
            $response->code = Response::METHODNOTALLOWED;
            $response->body = sprintf(
                'The HTTP method "%s" used for the request is not allowed for the resource "%s".',
                $request->method,
                $request->uri
            );

        }

        # good for debugging, remove this at some point
        $response->addHeader('X-Resource', get_class($this));

        return $response;

    }

}

/**
 * 404 resource class
 * @namespace Tonic\Lib
 */
class NoResource extends Resource {

    /**
     * Always return a 404 response.
     * @param Request request
     * @return Response
     */
    function exec($request) {

        // send 404 not found
        $response = new Response($request);
        $response->code = Response::NOTFOUND;
        $response->body = sprintf(
            'Nothing was found for the resource "%s".',
            $request->uri
        );
        return $response;

    }

}

/**
 * Model the data of the outgoing HTTP response
 * @namespace Tonic\Lib
 */
class Response {

    /**
     * HTTP response code constant
     */
    const OK = 200,
          CREATED = 201,
          NOCONTENT = 204,
          MOVEDPERMANENTLY = 301,
          FOUND = 302,
          SEEOTHER = 303,
          NOTMODIFIED = 304,
          TEMPORARYREDIRECT = 307,
          BADREQUEST = 400,
          UNAUTHORIZED = 401,
          FORBIDDEN = 403,
          NOTFOUND = 404,
          METHODNOTALLOWED = 405,
          NOTACCEPTABLE = 406,
          GONE = 410,
          LENGTHREQUIRED = 411,
          PRECONDITIONFAILED = 412,
          UNSUPPORTEDMEDIATYPE = 415,
          INTERNALSERVERERROR = 500;

    /**
     * The request object generating this response
     * @var Request
     */
    private $request;

    /**
     * The HTTP response code to send
     * @var int
     */
    public $code = Response::OK;

    /**
     * The HTTP headers to send
     * @var str[]
     */
    public $headers = array();

    /**
     * The HTTP response body to send
     * @var str
     */
    public $body;

    /**
     * Create a response object.
     * @param Request request The request object generating this response
     * @param str uri The URL of the actual resource being used to build the response
     */
    function __construct($request, $uri = NULL) {

        $this->request = $request;

        if ($uri && $uri != $request->uri) { // add content location header
            $this->addHeader('Content-Location', $uri);
            $this->addVary('Accept');
            $this->addVary('Accept-Language');
        }

    }

    /**
     * Convert the object into a string suitable for printing
     * @return str
     */
    function __toString() {
        $str = 'HTTP/1.1 '.$this->code;
        foreach ($this->headers as $name => $value) {
            $str .= "\n".$name.': '.$value;
        }
        return $str;
    }

    /**
     * Add a header to the response
     * @param str header
     * @param str value
     */
    function addHeader($header, $value) {
        $this->headers[$header] = $value;
    }

    /**
     * Add content encoding headers and encode the response body
     */
    function doContentEncoding() {
        if (ini_get('zlib.output_compression') == 0) { // do nothing if PHP will do the compression for us
            foreach ($this->request->acceptEncoding as $encoding) {
                switch($encoding) {
                case 'gzip':
                    $this->addHeader('Content-Encoding', 'gzip');
                    $this->addVary('Accept-Encoding');
                    $this->body = gzencode($this->body);
                    return;
                case 'deflate':
                    $this->addHeader('Content-Encoding', 'deflate');
                    $this->addVary('Accept-Encoding');
                    $this->body = gzdeflate($this->body);
                    return;
                case 'compress':
                    $this->addHeader('Content-Encoding', 'compress');
                    $this->addVary('Accept-Encoding');
                    $this->body = gzcompress($this->body);
                    return;
                case 'identity':
                    return;
                }
            }
        }
    }

    /**
     * Send a cache control header with the response
     * @param int time Cache length in seconds
     */
    function addCacheHeader($time = 86400) {
        if ($time) {
            $this->addHeader('Cache-Control', 'max-age='.$time.', must-revalidate');
        } else {
            $this->addHeader('Cache-Control', 'no-cache');
        }
    }

    /**
     * Send an etag with the response
     * @param str etag Etag value
     */
    function addEtag($etag) {
        $this->addHeader('Etag', '"'.$etag.'"');
    }

    function addVary($header) {
        if (isset($this->headers['Vary'])) {
            $this->headers['Vary'] .= ' '.$header;
        } else {
            $this->addHeader('Vary', $header);
        }
    }

    function output() {

        if (php_sapi_name() != 'cli' && !headers_sent()) {

            if ($this->body) {
                $this->doContentEncoding();
                $this->addHeader('Content-Length', strlen($this->body));
            }

            header('HTTP/1.1 '.$this->code);
            foreach ($this->headers as $header => $value) {
                header($header.': '.$value);
            }
        }

        echo $this->body;

    }

}

//=== RESSOURCE CLASSES ========================================================
// load examples
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



//=== MAIN ENTRY POINT =========================================================





// define url mapping
$urls = array();
$urls['/helloworld/(?P<bla>.*)']=array('class' => 'HelloWorldResource');



// handle request
$request = new Request();
$resource = $request->loadResource($urls);
$response = $resource->exec($request);
$response->output();

?>
