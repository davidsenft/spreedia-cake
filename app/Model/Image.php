<?php
/**
 * Image Model
 * Belongs to a single storename
 */

App::uses('AppModel', 'Model');

class Image extends AppModel {

	public $name = "Image";
	// public $cacheQueries = false;

	public $belongsTo = array(
		'Storename' => array(
			'className'    => 'Storename'
		),
		'Storeinstance' => array(
			'className'    => 'Storeinstance'
		)
	);

}