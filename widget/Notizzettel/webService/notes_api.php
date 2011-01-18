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

    //$response = NotesService::deleteNote('e46613l5-283e-4968-9df9-4081d0beba6a');

	$action = isset($_GET['action']) ? $_GET['action'] : '';
	$response = "";

	
	try{

		switch($action) {
			case 'getAllNotes':
				$response = NotesService::getAllNotes();
			break;

			case 'getSingleNote':
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

    private static function writeFileContent($filename, $content) {
                $file = fopen($filename,"w");
                fwrite($file, $content);
                fclose($file);
        
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

    public static function deleteNote($note_id) {
        $content = self::readFileContent(self::$filename);
        print_r($content);
        $php_content = json_decode($content, TRUE);
        $notes = $php_content['notes'];
        foreach ($notes as $key => $value) {
            if ($key == $note_id) {
                unset($notes[$key]);
            }
        }
        $php_content['notes'] = $notes;
        $content = json_encode($php_content);
        self::writeFileContent(self::$filename, $content);
    }
}
	
?>
