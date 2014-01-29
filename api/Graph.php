<?php

require_once './dbConfig.php';
require_once './vars.php';
require_once './User.php';

class Graph {
	
	var $sets = array();
	var $setProducts = array();
	var $insertId = null;
	var $returnmodel = array(
			"error" => null,
			"success" => 0,
			"message" => "",
			"data" => null
	);
	
	
	public function Graph($setHashString=null, $historyLength = 30, $interval = 1) {
		// parse the hash string and make an array of set hashes
		if($setHashString) {
			$this->sets = explode('|', $setHashString);
		}
	}
	
	/**
	 * Get the graphs for the active user
	 * 
	 * @param  string $graph the graph hash id
	 * @return {array}
	 */
	public function getGraphData($graph=null) {
		
		$user = $this->_getActiveUserId();
		$graphs = array();
		
		if($graph) {
			$sql = "SELECT id, name, hash FROM graphs WHERE hash = \"$graph\" AND user = $user";
		} else {
			$sql = "SELECT id, name, hash FROM graphs WHERE user = $user";
		}
		
		$result = $this->_query($sql);
		while($row = $result->fetch_assoc()) {
			
			$graphArr = array(
				"name" => $row['name'],
				"hash" => $row['hash'],
				"sets" => array()
			);
			
			if($graphSetsResult = $this->_query("select sets.name, sets.hash FROM sets INNER JOIN (SELECT `set` from graph_sets WHERE graph = " . $row['id'] . ") s2 on sets.hash = s2.set;")) {
				while($graphSetsRow = $graphSetsResult->fetch_assoc()) {
					
					array_push($graphArr['sets'], $graphSetsRow);
				}
			}
			
			array_push($graphs, $graphArr);
		}
		
		$this->returnmodel['success'] = 1;
		$this->returnmodel['message'] = "got the graphs";
		$this->returnmodel['data'] = $graphs;
		return $this->returnmodel;
	}
	
	
	/**
	 * Create and save a new graph to the database, along with the 
	 * specified list of sets
	 * 
	 * @param  array $data the POST date
	 * @return {array}
	 */
	public function createGraph($data) {
		$db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
		$name = mysqli_real_escape_string($db, $data['name']);
		$type = $data['type'];
		$sets = $data['sets'];
		$db->close();
		
		$user = $this->_getActiveUserId();
		$hash = uniqid();
		
		// create the graph DB row
		$sql = "INSERT INTO graphs (id, user, timestamp, name, hash) VALUES(null, $user, CURRENT_TIMESTAMP, \"$name\", \"$hash\")";
		if($result = $this->_query($sql)) {
			$setHashValues = array();
			foreach($sets as $hash) {
				array_push($setHashValues, "(NULL, $this->insertId, \"$hash\")");
			}
			
			$setHashValues = implode(", ", $setHashValues);
			
			//exit("INSERT INTO graph_sets(id, graph, `set`) VALUES $setHashValues");
			$result = $this->_query("INSERT INTO graph_sets(id, graph, `set`) VALUES $setHashValues");
			
		} 
		
		$this->returnmodel['success'] = 1;
		$this->returnmodel['message'] = "graph created";
		
		return $this->returnmodel;
	}
	
	
	
	/**
	 * Build a dataset (for nvd3 chars) for the sum of all checkouts for a set
	 * over time.
	 * 
	 * @param number $historyLength: days ago to get data
	 * @param number $interval: interval in days between each datapoint
	 * @return multitype: the data
	 */
	public function checkoutsOverTime($historyLength = 120, $interval = 1) {
		$data = array();
		// set the start date as now
		$startDate = date("Y-m-d H:i:s");
		//echo $startDate;
		//echo "\r\n";
		// find the end date
		$endDate = date('Y-m-d H:i:s', time()-60*60*24*$historyLength);
		//echo $endDate;
		
		
		// get the products from the defined sets and store them
		$setProducts = array();
		
		// iterate through each dataset
		// generate the data object model and fill it with relevant data
		foreach($this->sets as $hash) {
			
			// define the data object model for use with nvd3
			// 'values' in this case would be an array of arrays, the latter having the values [<unix timestamp>, <value>]
		
			$dataArray = array("key"=>$this->_getSetName($hash), "values" => array());
			$products = $this->_getSetProducts($hash);

			$productsInString = implode(',', $products);
			//echo $productsInString;
			
			// get the checkout data between now and the end of history
			// store the checkout rows in an array
			
			$checkoutData = array();
			$result = $this->_query("SELECT created, quantity FROM shoppingListProductsHistory WHERE ProductID IN($productsInString) AND created>\"$endDate\" AND created<\"$startDate\"", true);
			
			while($row = $result->fetch_assoc()) {
				array_push($checkoutData, $row);
			}
			
			

			// now we have the checkout data from the time period we want,
			// next step is to go through it and find the sum quantities for each interval
			// in the time period (for each set)
			
			// loop through the history with steps defined by the interval
			for($i = 0; $i<$historyLength; $i+=$interval) {
				//echo $i;
				$intervalQuantSum = 0;
				$currentTime = strtotime($startDate) - 60*60*24*$i;
				$endOfInterval = $currentTime + 60*60*24*$interval - 1;
				
				
				foreach($checkoutData as $row) {
					$timestamp = strtotime($row['created']);
					if($timestamp > $currentTime && $timestamp < $endOfInterval) {
						$intervalQuantSum+=$row['quantity'];
						
					}
				}
				array_push($dataArray['values'], array($currentTime*1000, $intervalQuantSum));
			}
			array_push($data, $dataArray);

		}
		
		$this->returnmodel['data'] = $data;
		$this->returnmodel['success'] = 1;
		$this->returnmodel['message'] = "Graph completed";
		return $this->returnmodel;
		
	}
	
	
	
	private function _getSetName($hash) {
		$result = $this->_query("SELECT name from sets where hash = \"$hash\";");
		$name = $result->fetch_row();
		return $name[0];	
	}
	
	
	/**
	 * Get a list of product ID's belonging to a set, defined by it's hash id
	 * 
	 * @param string $hash
	 * @return array: array of product ids
	 */
	private function _getSetProducts($hash) {
		$products = array();
		
		$sql = "SELECT setproducts.product_id FROM setproducts INNER JOIN (SELECT id FROM sets WHERE hash=\"$hash\") s1 on setproducts.set = s1.id;";
		$result = $this->_query($sql);
		
		if($result->num_rows<1) return false;
		
		while($row = $result->fetch_assoc()) {
			array_push($products, $row['product_id']);
		}
		
		return $products;
	}
	
	
	
	/**
	 * Create an array of time labels for use in graphs
	 * 
	 * @param unknown $dateStart
	 * @param number $interval
	 * @param number $length
	 * @return array: array of date labels
	 */
	private function _makeTimescales($dateStart, $interval=1, $length=30) {
		$timeScales = array();
		
		// array needs to be in ascending date order
		
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