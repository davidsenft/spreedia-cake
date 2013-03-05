<?php
/**
 * Activity model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Activity extends AppModel {

	public $name = "Activity";

	var $cacheQueries = false;

	/* public $hasAndBelongsToMany = array(
		'Storename' => array(
			'className'    => 'Storename'
		),
		'Storeinstance' => array(
			'className'    => 'Storeinstance'
		)
	); */

	public $hasMany = array('Activestoreinstance', 'Activestorename');

}