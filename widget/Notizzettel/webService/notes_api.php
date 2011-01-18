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

	$filename = "notes.json";

	$response = "";
	if ($_SERVER['REQUEST_METHOD'] == 'GET')
	{
	
		$action = isset($_GET['action']) ? $_GET['action'] : '';
		$filename = isset($_GET['apikey']) ? $_GET['apikey'].".json" : $filename;
		
	
		try{
			if(filter_var($filename, FILTER_VALIDATE_REGEXP, array("options"=>array("regexp"=>"/^[a-zA-Z0-9]+\.json$/"))) === false) {
				throw new Exception("APIKEY is syntactically wrong.");
			}
			if (!file_exists($filename)) {
				throw new Exception("APIKEY is wrong.");
			}
			$action = strtolower($action);
			switch($action) {
				case 'getallnotes':
					$response = NotesService::getAllNotes($filename);
					break;

				case 'getsinglenote':
					if(!isset($_GET['notes_id']))
						throw new Exception("Notes-ID is undefined.");
					else
						$response = NotesService::getSingleNote($_GET['notes_id'],$filename);
					if($response==NULL) {
						throw new Exception("No Note was found for this ID");
					}
					break;
				case 'gettagsweightened':
					$response = NotesService::getTagsWeightened($filename);
				break;

                case 'updatenote': 
					$uuid = isset($_GET['uuid']) ? $_GET['uuid'] : '';
					$response = NotesService::updateNote($uuid,$_GET['json_note'],$filename);
					
					break;
				case 'getnotesfortag':
					if(!isset($_GET['tag']))
						throw new Exception("Tag is undefined.");
					else
						$response = NotesService::getNotesForTag($_GET['tag'],$filename);
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
		$filename = isset($_POST['apikey']) ? $_POST['apikey'].".json" : $filename;
		try{
			if(filter_var($filename, FILTER_VALIDATE_REGEXP, array("options"=>array("regexp"=>"/^[a-zA-Z0-9]+\.json$/"))) === false) {
				throw new Exception("APIKEY is syntactically wrong.");
			}
			if (!file_exists($filename)) {
				throw new Exception("APIKEY is wrong.");
			}
			$action = strtolower($action);
			switch($action) {
				case 'updatenote': 
					$uuid = isset($_POST['uuid']) ? $_POST['uuid'] : '';
					$response = NotesService::updateNote($uuid,$_POST['json_note'],$filename);
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
	
	private static function readFileContent($filename) {
			$file = fopen($filename,"r");
			if ($file == FALSE) {
				error_log('fnf');			
				throw new Exception("DB File not found");
			}
			$content = fread($file, filesize($filename));
			fclose($file);
			return $content;
	}

	private static function writeFileContent($filename, $content) {
		$file = fopen($filename,"w");
		fwrite($file, $content);
		fclose($file);
	}

	private static function arrayToJson($arr) {
		return self::json_format(json_encode($arr));
	}
	
	public static function getAllNotes($filename) {
		return self::readFileContent($filename);
	}


    public static function getSingleNote($note_id,$filename) {
        $content = self::readFileContent($filename);
        
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


    public static function deleteNote($note_id, $filename) {
        $content = self::readFileContent($filename);
        print_r($content);
        $php_content = json_decode($content, TRUE);
        $notes = $php_content['notes'];
        foreach ($notes as $key => $value) {
            if ($key == $note_id) {
                unset($notes[$key]);
            }
        }
        $php_content['notes'] = $notes;
        $content = self::arrayToJson($php_content);
        self::writeFileContent($filename, $content);
    }


	public static function updateNote($uuid, $json_note,$filename){
		
		
		$content = self::readFileContent($filename);
		$php_content = json_decode($content,TRUE);
		$notes = $php_content['notes'];
		if ($uuid == '') $uuid = self::uuid();
		//error_log($json_note);
		$new_note = json_decode($json_note,TRUE);
		$notes[$uuid] = $new_note;
		//#rint $new_note;
		$php_content['notes']=$notes;
		$content = self::arrayToJson($php_content);
		self::writeFileContent($filename, $content);
	    return $content;
	}

	public static function getTagsWeightened($filename) {
        	$content = self::readFileContent($filename);
		$php_content = json_decode($content,TRUE);
		$notes = $php_content['notes'];

		$tags=array();
		foreach ($notes as $key => $value) {
			$taglist = $value['tags'];
			foreach ($taglist as $tag) {
				if(array_key_exists($tag, $tags)) {
					$val = $tags[$tag];
					$val = $val + 1;
					$tags[$tag] = $val;
				} else {
					$tags[$tag] = 1;
				}
			}
		}
                $result = json_encode($tags);
		return $result;
	}

	public static function getNotesForTag($tag, $filename) {
		$content = self::readFileContent($filename);
		$php_content = json_decode($content,TRUE);
		$notes = $php_content['notes'];

		foreach ($notes as $key => $value) {
				$taglist = $value['tags'];
				$found = false;
				foreach($taglist as $stag) {
					if(strcmp($tag, $stag) == 0) {
						$found = true;
					}
				}
				if(!$found) {
					unset($notes[$key]);
				}
		}
		$php_content['notes'] = $notes;
        	$content = self::arrayToJson($php_content);
		return $content;
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

	private static function json_format($json)
	{
		$tab = "  ";
		$new_json = "";
		$indent_level = 0;
		$in_string = false;

		$json_obj = json_decode($json);

		if($json_obj === false)
		    return false;

		$json = json_encode($json_obj);
		$len = strlen($json);

		for($c = 0; $c < $len; $c++)
		{
		    $char = $json[$c];
		    switch($char)
		    {
		        case '{':
		        case '[':
		            if(!$in_string)
		            {
		                $new_json .= $char . "\n" . str_repeat($tab, $indent_level+1);
		                $indent_level++;
		            }
		            else
		            {
		                $new_json .= $char;
		            }
		            break;
		        case '}':
		        case ']':
		            if(!$in_string)
		            {
		                $indent_level--;
		                $new_json .= "\n" . str_repeat($tab, $indent_level) . $char;
		            }
		            else
		            {
		                $new_json .= $char;
		            }
		            break;
		        case ',':
		            if(!$in_string)
		            {
		                $new_json .= ",\n" . str_repeat($tab, $indent_level);
		            }
		            else
		            {
		                $new_json .= $char;
		            }
		            break;
		        case ':':
		            if(!$in_string)
		            {
		                $new_json .= ": ";
		            }
		            else
		            {
		                $new_json .= $char;
		            }
		            break;
		        case '"':
		            if($c > 0 && $json[$c-1] != '\\')
		            {
		                $in_string = !$in_string;
		            }
		        default:
		            $new_json .= $char;
		            break;                   
		    }
		}

		return $new_json;
	} 
}
	
?>
