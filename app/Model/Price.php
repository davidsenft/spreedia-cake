<?php
/**
 * Location model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Price extends AppModel {
	
	public $name = "Price";
	public $cacheQueries = true;
	
	public $hasAndBelongsToMany = array(
		'Pricerange' => array(
			'className' => 'Pricerange'
		)
	);
    
}