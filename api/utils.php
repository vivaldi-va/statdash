<?php


require_once './dbConfig.php';

class Utils {
	
	public function getProductSearch($query, $filters = null) {
		$returnModel = array(
				"error" => null,
				"success" => 0,
				"message" => "",
				"data" => null
		);
		
		
		
		//$query = mysqli_real_escape_string($connection = new mysqli(ON_DB_HOST, ON_DB_USER, ON_DB_PASS, ON_DB_NAME, ON_DB_PORT), $query);
		
		
		//$connection->close();

		
		
		// explode/implode string to allow for term matching from any order
		$queryTermArr = array();
		$queryTermArr = explode(' ', $query);
		
		// create array of filter terms if there are any
		if($filters) {
			$filterArr = explode('|', $filters);
			$queryTermArr = array_merge($queryTermArr, $filterArr);
		}
		
		$sqlAndString = "name LIKE \"%" . implode("%\" AND name LIKE \"%", $queryTermArr) . "%\"";
		
		
		$sql = "SELECT id, name, barcode, categoryID, created, picUrl 
				FROM products 
				WHERE $sqlAndString
						OR barcode = \"%$query%\"";
		
		$returnModel['debug'] = $sql;
		//exit($sql);
		$result = $this->_query($sql, true);
		if($result) {
			
			if($result->num_rows == 0)
				$returnModel['error'] = "no results found";
			else {
				$returnModel['data'] = array("filter_terms" => [], "results" => []);
				while($row = $result->fetch_assoc()) {
					$row['name'] = utf8_encode($row['name']);
					array_push($returnModel['data']['results'], $row);
				}
				
				$returnModel['data']['filter_terms'] = $this->getFilterTerms($query, $returnModel['data']['results']);
			}
			
			
		}
		
		return $returnModel;
	}
	
	
	
	/**
	 * 
	 * generate an array of keywords to use as search filters
	 * Keywords will be ranked in order of occurance (not including the search query/queries)
	 * 
	 * @param unknown $parameter
	 * @param unknown $results
	 * @return multitype:
	 */
	public function getFilterTerms($parameter, $results) {
		$keywords 	= array();
		$frequency 	= array();
		$topTenArr 	= array();
		// for each of the result rows
		
		foreach($results AS $array) {
			
			$name = strtolower($array['name']);
			
			// explode the product name into keywords by space delimitaion
			$explode = explode(" ", $name);
			
			/*
			 * for each of the keywords, check if they have been 
			 * added into the keyword array. 
			 * If not, add them via push
			 */
			
			foreach($explode AS $word) 
			{
				//exit(json_encode($word));
				if (preg_match('/(\w+)+/', $word) && $word != $parameter) {
						
					if(!isset($keywords[$word])) {
						$keywords[$word] = 1;
					} else {
						$keywords[$word]++;
					}
				}
				
				
			}
			
			// sort the array by freqency of occurance
			arsort($keywords);
				
			$i = 0;
			foreach($keywords AS $keyword => $freq) {
				if ($i < 10) {
					$topTenArr[$keyword] = $freq;
					$i++;
				} else {
					break;
				}
			}
			
	
		} 
		
		
		//exit(json_encode($keywords));
		arsort($topTenArr);
		$return = array();
		foreach($topTenArr AS $word => $freq) {
			$termArr = array("keyword" => $word, "frequency" => $freq);
			array_push($return, $termArr);	
		}	
		return $return;
	}
	
	
	/**
	 * handles database connections and sql queries to the database
	 * 
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
