<?php
/**
 * Storename Model (e.g. represents "Crush Boutique" or "Gap")
 * A Storename may have any number of store instances
 * The following store attributes are assigned to the Storename:
 *  - Price range
 *  - Icons
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
		),
		'Image' => array(
			'className'    => 'Image',
			'conditions'   => array('Image.statusID' => '1'),
			'dependent'    => true
		),
		'Activestorename' => array(
			'className'    => 'Activestorename',
			'dependent'    => true
		)
	);
	
	public $hasAndBelongsToMany = array(
		'Icon' => array(
			'className'    => 'Icon',
			'order'        => 'Icon.name ASC'
		),
		'Activity' => array(
			'className'    => 'Activity',
			'joinTable'    => 'activities_storenames',
			'associationForeignKey'   => 'storename_id' // ,
			/* 'conditions'   => array(
				'Activity.statusID' => '1',
			) */
		)
	);
      
}