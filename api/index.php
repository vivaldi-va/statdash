<?php

require_once './User.php';
//require_once './Set.php';
require_once './utils.php';

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$utils = new Utils();


if(isset($_REQUEST['query'])) {
	$q = $_REQUEST['query'];
	$data = json_decode(file_get_contents('php://input'), true);
	
	switch($q) {
		case 'register':
			if($data) {
				$user = new User();
				$result = $user->register($data['email'], $data['name'], $data['password']);
				
				exit(json_encode($result));
			}
			break;
		case 'checksession':
			$user = new User();
			exit(json_encode($user->checkSession()));
			break;
		case 'login': 
			if($data) {
				$user = new User();
				$result = $user->login($data['email'], $data['password']);
				
				exit(json_encode($result));
			}
			break;
		case 'logout':
			$user = new User();
			exit($user->logout());
			break;
		case 'pass-reset':
			break;
			
		case 'search':
			if(isset($_REQUEST['term'])) {
				if(isset($_REQUEST['filter_terms'])) 
						exit(json_encode($utils->getProductSearch($_REQUEST['term'], $_REQUEST['filter_terms'])));
				else
					exit(json_encode($utils->getProductSearch($_REQUEST['term'])));
			}
				
			
			break;
			
		case 'createset':
			break;
		case 'editset':
			break;
		case 'removeset':
			break;
		case 'newgraph':
			break;
			
	}
	
	
	
	
	
	
}