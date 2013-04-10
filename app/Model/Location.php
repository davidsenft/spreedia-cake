<?php
/**
 * Location model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Location extends AppModel {
	
	public $name = "Location";
	// public $cacheQueries = false;
	public $actsAs = array('Containable');
	public $recursive = 2;
	
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

	// TODO: no need to pass loc?
	public function recursiveStoreInstances($loc){
		return getStoreInstancesRecursive($loc); // in bootstrap.php
	}

	public function getContained(){
		// TODO: can this just be done by the Model class itself, without a function?
		// TODO: or can we store it in the model somehow for easy access and check if it's there already?
		// $this->recursive = 2;
		$this->contain(array(
			// 'Parent.Parent',
			'Parent.Parent.Parent',
			// 'Child', ????
			// 'Child.Child', ????
			'Storeinstance',
			'Child.Storeinstance',
			'Child.Child.Storeinstance'
			// 'Storeinstance.Storename',
			// 'Child.Storeinstance.Storename',
			// 'Child.Child.Storeinstance.Storename'
		));
		return $this->read();
	}
    
}