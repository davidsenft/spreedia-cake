<?php
/**
 * User model for Spreedia.
 */

App::uses('AppModel', 'Model');

class User extends AppModel {
	
	public $name = "User";
	public $cacheQueries = false;
	public $scaffold;

	public function beforeSave($options = array()) {
	    parent::beforeSave($options);
	    if (!empty($this->data['User']['pwd-unhashed'])) {
	    	// hash the password
	        $this->data['User']['password'] = AuthComponent::password($this->data['User']['pwd-unhashed']);
	    }
	    return true;
	}

	public function index(){
		
	}

}