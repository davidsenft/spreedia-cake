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

	// TODO: hasAndBelongsToMany Activity?

	// Return location with virtual fields City and Top determined recursively
	public function extendLocation($loc){
		// TODO turn these into collections rather than just names?
		list($city,$top) = getCityAndTop($loc); // in bootstrap.php
		$location = $loc['Location'];
		$location['City'] = $city; 
		$location['Top'] = $top;
		return $location;
	}

	// Return children and children's children, etc., determined recursively
	public function recursiveChildren($child){
		return getChildrenRecursive($child); // in bootstrap.php
	}
    
}