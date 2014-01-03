<?php

require_once './dbConfig.php';
require_once './vars.php';

class User {
	
	
	/**
	 * Register a new user to the service
	 * 
	 * @param string $email
	 * @param string $name
	 * @param string $password
	 * @return filled return model: array
	 */
	public function register($email, $name, $password) {
		
		$returnModel = array(
				"error" => null,
				"success" => 0,
				"message" => "",
				"data" => null
		);
		
		/*
		 * check validity of info
		 */
		
		// check password length
		
		if(strlen($password) < 6) {
			$returnModel['error'] = "password is too short (min. 6 characters)";
			return $returnModel;
		} 
		// email address not entered?
		else if(empty($email) || !$email) {
			$returnModel['error'] = "no email address entered";
			return $returnModel;
		}
		// name not entered?
		else if(empty($name) || !$name) {
			$returnModel['error'] = "no name entered";
			return $returnModel;
		}
		
		
		
		// sanitise input info
		$email = mysql_real_escape_string($email);
		$password = mysql_real_escape_string($password);
		$name = mysql_real_escape_string($name);
		
		
		// check for existing user
		
		if($this->_checkUserExists($email)) {
			$returnModel['error'] = "email already registered";
			return $returnModel;
		}
		
		// encrypt password with salt
		$salt = $this->_makeSalt();
		$passHash = md5( md5($password) . md5($salt) );
		
		// insert data to DB
		
		$ip = $_SERVER['REMOTE_ADDR'];
		
		$addUserSql = "INSERT INTO users (id, email, salt, pass, created, reg_ip, last_logged_in, last_ip, account_level, invited_by, company) 
						values(NULL, \"$email\", \"$salt\", \"$passHash\", CURRENT_TIMESTAMP, \"$ip\", CURRENT_TIMESTAMP, \"$ip\", 0, 0, 0)";
		
		if(!$this->_query($addUserSql)) {
			$returnModel['error'] = "failed to register user, please try again";
			$returnModel['debug'] = $addUserSql;
			return $returnModel;
		}
		
		$returnModel['message'] = "registration successful";
		$returnModel['success'] = 1;
		
		return $returnModel;
	}
	
	
	public function login($email, $password) {

		$returnModel = array(
				"error" => null,
				"success" => 0,
				"message" => "",
				"data" => null
		);
		
		
		/*
		 * check if session already exists
		 */
		
		
		
		/*
		 * sanitize input data
		 */
		
		$email = mysql_real_escape_string($email);
		$password = mysql_real_escape_string($password);
		
		/*
		 * validate input data
		 */
		
		if(!$email || empty($email)) {
			$returnModel['error'] = "no email entered";
			return $returnModel;
		} else if(!$password || empty($password)) {
			$returnModel['error'] = "no password entered";
			return $returnModel;
		}
		
		
		/*
		 * check user exists
		 */
		
		if(!$this->_checkUserExists($email)) {
			$returnModel['error'] = "user not found";
			return $returnModel;
		}
		
		/*
		 * get user info
		 * re-hash password and compare against stored password
		 */
		
		$userInfo = $this->_getUserInfo($email);
		$storedPass = $userInfo['pass'];
		$salt = $userInfo['salt'];
		
		$passHash = md5( md5($password) . md5($salt) );
		
		if(!$passHash == $storedPass) {
			$returnModel['error'] = "incorrect password";
			return $returnModel;
		}
		
		/*
		 * TODO: update login ip and timestamp 
		 */
		
		/*
		 * create user session
		 */
		
		$_SESSION['av_statdash_email'] = $email;
		setcookie("av_statdash_email", $email, time()+COOKIE_EXPIRE, COOKIE_PATH);
		
		$returnModel['success'] = 1;
		$returnModel['message'] = "login successful";
		
		return $returnModel;
		
	}
	
	public function logout() {
		if (isset($_COOKIE['av_statdash_email'])){
			setcookie("av_statdash_email", "", time()-COOKIE_EXPIRE, COOKIE_PATH);
		}
		
		/* Unset PHP session variables */
		unset($_SESSION['av_statdash_email']);
		
	}
	
	public function checkSession() {
		
		$returnModel = array(
				"error" => null,
				"success" => 0,
				"message" => "",
				"data" => null
		);
		
		/*
		 * if cookies are set
		 * check that user exists
		 * if true, return truethy success indicating user is logged in
		 * and is authenticated
		 */
		if(isset($_COOKIE['av_statdash_email'])) {
			$email = mysql_real_escape_string($_COOKIE['av_statdash_email']);
			if ($this->_checkUserExists($email)) {
				$_SESSION['av_statdash_email'] = $email;
				$returnModel['success'] = 1;
			}
		} else if (isset($_SESSION['av_statdash_email'])) {
			if ($this->_checkUserExists($email)) {
				$returnModel['success'] = 1;
			}			
		} else {
			$returnModel['message'] = "user not logged in";
		}
		

		return $returnModel;
	}
	
	public function resetPassword($email) {
		
	}
	
	private function _getUserInfo($email) {
		$sql = "SELECT * FROM users WHERE email = \"$email\"";
		
		$result = $this->_query($sql);
		return $result->fetch_assoc();
	}
	
	private function _checkUserExists($email) {
		
		$sql = "SELECT email FROM users WHERE email = \"$email\"";
		
		$result = $this->_query($sql);
		if ($result->num_rows > 0) {
			return true;
		} else {
			return false;
		}
	}
	
	
	/**
	 * function to generate a unique salt string to encrypt passwords with
	 * @return salt: string
	 */
	private function _makeSalt() {
		return uniqid();
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
		$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT);
		
		// if connection error, return error message
		if($db->connect_errno) {
			$returnModel['error'] = $db->connect_error;
			return $returnModel;
		}	
		
		// if database query fails, return query error
		if(!$result = $db->query($sql)) {
			$returnModel['error'] = $db->error;
		}
		
		/*
		 * if everything works up to this point, just return the result
		 * model returning will be handled by the public function
		 */
		return $result;
		
		
		
	}
}