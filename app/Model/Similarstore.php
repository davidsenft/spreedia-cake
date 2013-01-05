<?php
/**
 * Store model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Similarstore extends AppModel {

	public $name = "Similarstore";

	var $cacheQueries = false;

	public $belongsTo = array(
		'Fromstore' => array(
			'className'    => 'Storeinstance',
			'foreignKey'   => 'storeinstance_id',
			'conditions'   => array('Fromstore.statusID' => '1')
		),
		'Tostore' => array(
			'className'    => 'Storeinstance',
			'foreignKey'   => 'similarinstance_id',
			'conditions'   => array('Tostore.statusID' => '1')
		)
	);

}