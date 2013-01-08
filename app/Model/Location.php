<?php
/**
 * Location model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Location extends AppModel {
	
	public $name = "Location";
	public $cacheQueries = false;
	public $actsAs = array('Containable');
	
	// Relationships
	
	public $belongsTo = array(
		'Parent' => array(
			'className'    => 'Location',
			'foreignKey'   => 'parent',
			'conditions'   => array('Parent.statusID' => '1')
		)
	);
	
	public $hasMany = array(
		'Storeinstance' => array(
			'className'    => 'Storeinstance',
			'conditions'   => array('Storeinstance.statusID' => '1'),
			'dependent'    => false
		),
		'Child' => array(
			'className'    => 'Location',
			'foreignKey'   => 'parent',
			'conditions'   => array('Child.statusID' => '1'),
			'dependent'    => false
		)
	);
	
	public function isActive(){
		return $this->field('statusID')==1 ? true : false;
	}
    
}