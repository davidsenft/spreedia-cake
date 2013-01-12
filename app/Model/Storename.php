<?php
/**
 * Store model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Storename extends AppModel {
	
	public $name = "Storename";
	public $cacheQueries = false;
	
	public $belongsTo = array(
		'Pricerange' => array(
			'className'    => 'Pricerange'
		)
	);
	
	public $hasMany = array(
		'Storeinstance' => array(
			'className'    => 'Storeinstance',
			'conditions'   => array('Storeinstance.statusID' => '1'),
			'dependent'    => true
		)
	);
	
	public $hasAndBelongsToMany = array(
		'Icon' => array(
			'className'    => 'Icon',
			'order'        => 'Icon.name ASC'
		)
	);
      
}