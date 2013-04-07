<?php
/**
 * User model for Spreedia.
 */

App::uses('AppModel', 'Model');

class User extends AppModel {
	
	public $name = "User";
	public $cacheQueries = false;

	public $validate = array(
        'username' => array(
            'required' => array(
                'rule' => array('notEmpty'),
                'message' => 'A username is required'
            )
        ),
        'password' => array(
            'required' => array(
                'rule' => array('notEmpty'),
                'message' => 'A password is required'
            )
        )
    );

    public $hasMany = array(
		'Savedstore' => array(
			'className'    => 'Savedstore',
			'dependent'    => true
		),
		'Managedstore' => array(
			'className'    => 'Managedstore',
			'dependent'    => true
		)
	);

	public function beforeSave($options = array()) {
	    // parent::beforeSave($options);
	    if (!empty($this->data[$this->alias]['pwd-unhashed'])) {
	    	// hash the password
	        $this->data[$this->alias]['password'] = AuthComponent::password($this->data[$this->alias]['pwd-unhashed']);
	    }
	    return true;
	}

}