<?php
/**
 * A very simple API for a web service implemented in PHP
 * Notice to capture all possible server side errors and return a reasonable error message to the client
 * The API MUST return a valid response IN ANY CASE, also if some errors occure.
 * Consider always the WORST CASE that can happen!
 * The client should check the response if it is an error notice or not.
 * In case of an error the client is responsoble to handle the error case and notice the user respectively
 * - Errors can be user caused (such as invalid user inputs)
 * - Errors can be server caused (internal server errors, connection timeouts, DB exceptions etc..)
 */
	
	
	$action = isset($_GET['action']) ? $_GET['action'] : '';
	$response = "";

	
	try{

		switch($action) {
			case 'getXXXData'
				// fill $response with node server
			break;
			
			default:
				// action is empty or not defined
				throw new Exception("Action is undefined.");
			break;
		}
		
	}
	catch(Exception $e) {
		$response = '{"error": "'.$e->getMessage().'"}';
	}
	

	header("Pragma: public");
	header("Cache-Control: public");
	// delete browser cache
	header('Expires: ' . gmdate("D, d M Y H:i:s", (time()-60000)) . " GMT");
	header("Content-Length: " . strlen($response));
	echo $response;




//-----------------------------------------------------------------------------

/**
 * static class provides the web services
 * returns all responses as JSON
 */
class NotesService {
	private static function arrayToJson($arr) {
		return json_encode($arr);
	}
	
	public static function getXXXData() {
		$xxx_data = array(
			"id" => 1,
			"text" => "I'm a Note"
		);
		return json_encode($xxx_data);
	}
}
	
?>
