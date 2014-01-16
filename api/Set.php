<?php

require_once './dbConfig.php';
require_once './vars.php';
require_once './User.php';


class Set {

	// ID for newly inserted row
	var $insertId = null;
	
	
	
	/**
	 * get specific set from hash id
	 * 
	 * @param string $id
	 */
	public function getSet($id) {
		
	}
	
	/**
	 * Get all data sets for the current user
	 * 
	 */
	public function getUserSets() {
		$user = $this->_getActiveUserId();
		$setData = array();
		
		$returnModel = array(
				"error" => null,
				"success" => 0,
				"message" => "",
				"data" => null
		);
		
		// set model to use as a template for creating the set data array
		$setModel = array(
			"name" => null,
			"hash" => null,
			"products" => array()
		);
		
		// 1. get sets
		// 2. for each set get the set products
		// 3. for each set product, get the product info from ostosnero.
		// 4. populate the set model with the data
		// 5. push the set model into the set data array
		// 6. repeat 2. until done.
		
		$sql = "SELECT `id`, `hash`, `name` FROM sets WHERE user = $user";
		
		$result = $this->_query($sql);
		while($row = $result->fetch_assoc()) {
			$setModel['name'] = $row['name']; 
			$setModel['hash'] = $row['hash']; 
			
			$sql = "SELECT product_id FROM setproducts WHERE `set` = ".$row['id'];
			//exit($sql);
			$setProductsResult = $this->_query($sql);
			$productIdArr = array();
			while($setProductsRow = $setProductsResult->fetch_assoc()) {
				array_push($productIdArr, $setProductsRow['product_id']);
			}
			
			
			// only get the product info if set has products
			if(!empty($productIdArr)) {
				$setModel['products'] = $this->_getProductInfo($productIdArr);
			}
			
			array_push($setData, $setModel);
		} 
		
		$returnModel['success'] = 1;
		$returnModel['data'] = $setData;
		$returnModel['message'] = "sets retrieved successfully";
		
		return $returnModel;
		
	}
	
	public function createSet($data) {
		
		$returnModel = array(
				"error" => null,
				"success" => 0,
				"message" => "",
				"data" => null
		);
		
		$name = mysqli_real_escape_string(new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME), $data['name']);
		$productIdArr = $data['products'];
		$setHashId = uniqid();
		$user = $this->_getActiveUserId();
		$setProductValueStrings = array();

		$sql = "INSERT INTO sets (id, hash, user, name, category, created, updated) VALUES (NULL, \"$setHashId\", $user, \"$name\", 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);";
		//exit($sql);
		if($result = $this->_query($sql)) {
			foreach($productIdArr as $id) {
				array_push($setProductValueStrings, "(NULL, $this->insertId, $id)");
			}
			
			$setProductValueStrings = implode(", ", $setProductValueStrings);
			
			$sql = "INSERT INTO setproducts (`id`, `set`, `product_id`) VALUES $setProductValueStrings";
			//exit($sql);
			if($result = $this->_query($sql)) {
				$returnModel['success'] = 1;
				$returnModel['message'] = "set created successfully";
			}
			
			return $returnModel;
		}
				

	}
	
	private function _getProductInfo($idArr) {
		$idArr = implode(", ", $idArr);
		$sql = "SELECT barcode, categoryID, brandID, picUrl as pic, name FROM products WHERE id IN ($idArr)";
//		exit($idArr);
		$productsArr = array();
		$result = $this->_query($sql, true);
		while($row = $result->fetch_assoc()) {
			$row['name'] = utf8_encode($row['name']);
			array_push($productsArr, $row); 
		}
		
		return $productsArr;
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
	private function _query($sql, $onDb = false) {

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
			exit(json_encode($returnModel));
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
		$this->insertId = $db->insert_id;
		return $result;

		$db->close();

	}
}