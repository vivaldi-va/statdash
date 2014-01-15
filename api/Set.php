<?php

require_once './dbConfig.php';
require_once './vars.php';
require_once './User.php';


class Set {
	
	public function createSet($data) {
		$name = $data['name'];
		$productIdArr = $data['data'];
		
		$user = $this->_getActiveUserId();
		
		
		
	}
	
	
	/**
	 * using the User class, get the email from the checkSession function, then
	 * query using the email contained in the resulting user info to find the database 
	 * id for the user;
	 * 
	 * @return int: userId
	 */
	private function _getActiveUserId() {
		$user = new User();
		$user = $user->checkSession();
		$email = $user['data']['email'];
		
		$res = $this->_query("SELECT id FROM users WHERE email = \"$email\"");
		$row = $res->fetch_row();
		return $row[0];
	}
	
	
	/**
	 * handles database connections and sql queries to the database
	 * @param string $sql
	 * @return result object or array containing debug/error messages
	 */
	private function _query($sql) {
		
		// model used to structure return data
		$returnModel = array(
				"error" => null,
				"success" => 0,
				"message" => "",
				"data" => null
		);
	
		// connect to database with mysqli
		if($onDb) $db = new mysqli(ON_DB_HOST, ON_DB_USER, ON_DB_PASS, ON_DB_NAME, ON_DB_PORT);
		else $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
	
		// if connection error, return error message
		if($db->connect_errno) {
			$returnModel['error'] = $db->connect_error;
			return $returnModel;
		}
	
		// if database query fails, return query error
		if(!$result = $db->query($sql)) {
			$returnModel['error'] = $db->error;
			$returnModel['message'] = $db->sqlstate;
			
			exit(json_encode($returnModel));
		}
	
		/*
		 * if everything works up to this point, just return the result
		* model returning will be handled by the public function
		*/
		return $result;
		
		
		
	}
}