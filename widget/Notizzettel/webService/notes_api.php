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

    #$response = NotesService::getSpecificNote(1);
	error_log("METHOD: ".$_SERVER['REQUEST_METHOD']);

	$response = "";
	if ($_SERVER['REQUEST_METHOD'] == 'GET')
	{
	
		$action = isset($_GET['action']) ? $_GET['action'] : '';
	

	
		try{
			$action = strtolower($action);
			switch($action) {
				case 'getallnotes':
					$response = NotesService::getAllNotes();
					break;

				case 'getsinglenote':
					if(!isset($_GET['notes_id']))
						throw new Exception("Notes-ID is undefined.");
					else
						$response = NotesService::getSingleNote($_GET['notes_id']);
		            if($response==NULL) {
		                throw new Exception("No Note was found for this ID");
		            }
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
	}
	else{
		$action = isset($_POST['action']) ? $_POST['action'] : '';
		
		try{
			$action = strtolower($action);
			switch($action) {
				case 'updatenote': 
					$uuid = isset($_POST['uuid']) ? $_POST['uuid'] : '';
					$response = NotesService::updateNote($uuid,$_POST['json_note']);
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
    private static $filename = "notes.json";
	private static function readFileContent($filename) {
                $file = fopen($filename,"r");
                $content = fread($file, filesize($filename));
                fclose($file);
		        return $content;
	}

	private static function arrayToJson($arr) {
		return json_encode($arr);
	}
	
	public static function getAllNotes() {
		return self::readFileContent(self::$filename);
	}

    public static function getSingleNote($note_id) {
        $content = self::readFileContent(self::$filename);
        
        #$content = json_encode($content);
        $php_content = json_decode($content,TRUE);
        $notes = $php_content['notes'];
        foreach ($notes as $key => $value) {
            if ($key == $note_id) {
                $result = json_encode($value);
                break;
            }
        }
        return $result;

        #print $php_content->{'notes'};
    }

	public static function updateNote($uuid, $json_note){
		
		$content = self::readFileContent(self::$filename);
		$php_content = json_decode($content,TRUE);
		$notes = $php_content['notes'];
		if ($uuid == '') $uuid = self::uuid();
		error_log($json_note);
		$new_note = json_decode($json_note,TRUE);
		$notes[$uuid] = $new_note;
		print $new_note;
		return self::arrayToJson($notes);
	
	}

	/**
	 * Generates a Universally Unique IDentifier, version 4.
	 *
	 * RFC 4122 (http://www.ietf.org/rfc/rfc4122.txt) defines a special type of Globally
	 * Unique IDentifiers (GUID), as well as several methods for producing them. One
	 * such method, described in section 4.4, is based on truly random or pseudo-random
	 * number generators, and is therefore implementable in a language like PHP.
	 *
	 * We choose to produce pseudo-random numbers with the Mersenne Twister, and to always
	 * limit single generated numbers to 16 bits (ie. the decimal value 65535). That is
	 * because, even on 32-bit systems, PHP's RAND_MAX will often be the maximum *signed*
	 * value, with only the equivalent of 31 significant bits. Producing two 16-bit random
	 * numbers to make up a 32-bit one is less efficient, but guarantees that all 32 bits
	 * are random.
	 *
	 * The algorithm for version 4 UUIDs (ie. those based on random number generators)
	 * states that all 128 bits separated into the various fields (32 bits, 16 bits, 16 bits,
	 * 8 bits and 8 bits, 48 bits) should be random, except : (a) the version number should
	 * be the last 4 bits in the 3rd field, and (b) bits 6 and 7 of the 4th field should
	 * be 01. We try to conform to that definition as efficiently as possible, generating
	 * smaller values where possible, and minimizing the number of base conversions.
	 *
	 * @copyright   Copyright (c) CFD Labs, 2006. This function may be used freely for
	 *              any purpose ; it is distributed without any form of warranty whatsoever.
	 * @author      David Holmes <dholmes@cfdsoftware.net>
	 *
	 * @return  string  A UUID, made up of 32 hex digits and 4 hyphens.
	 */

	private static function uuid() {
	   
		// The field names refer to RFC 4122 section 4.1.2

		return sprintf('%04x%04x-%04x-%03x4-%04x-%04x%04x%04x',
		    mt_rand(0, 65535), mt_rand(0, 65535), // 32 bits for "time_low"
		    mt_rand(0, 65535), // 16 bits for "time_mid"
		    mt_rand(0, 4095),  // 12 bits before the 0100 of (version) 4 for "time_hi_and_version"
		    bindec(substr_replace(sprintf('%016b', mt_rand(0, 65535)), '01', 6, 2)),
		        // 8 bits, the last two of which (positions 6 and 7) are 01, for "clk_seq_hi_res"
		        // (hence, the 2nd hex digit after the 3rd hyphen can only be 1, 5, 9 or d)
		        // 8 bits for "clk_seq_low"
		    mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535) // 48 bits for "node" 
		); 
	}
}
	
?>
