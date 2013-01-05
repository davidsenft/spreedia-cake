<?php
/**
 * Location model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Pricerange extends AppModel {
	
	public $name = "Pricerange";
	public $displayField = "range";
	public $cacheQueries = true;
	
	public $hasMany = array(
		'Storename' => array(
			'dependent'    => false
		)
	);
	
	public $hasAndBelongsToMany = array(
		'Price' => array(
			'className' => 'Price'
		)
	);
    
}