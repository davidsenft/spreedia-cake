<?php
/**
 * Store model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Storeinstance extends AppModel {
	
	public $name = "Storeinstance";
	public $cacheQueries = false;

	public $belongsTo = array(
		'Storename' => array(
			'className'    => 'Storename'
		),
		'Location' => array(
			'className'    => 'Location'
		)
	);
	
	public $hasMany = array(
		'Similarstore' => array(
			'className'    => 'Similarstore',
			'dependent'    => true
		),
		'Activestoreinstance' => array(
			'className'    => 'Activestoreinstance',
			'dependent'    => true
		)
	);
    
	public $hasAndBelongsToMany = array(
		'Post' => array(
    		'className'    => 'Post',
    		'joinTable'    => 'posts_storeinstances',
    		'associationForeignKey'   => 'post_id',
			'conditions'   => array(
				'Post.post_type' => 'post', 
				'Post.post_status' => 'publish'
			)
		),
		'Activity' => array(
			'className'    => 'Activity',
			'joinTable'    => 'activities_storeinstances',
			'associationForeignKey'   => 'storeinstance_id' // ,
			/* 'conditions'   => array(
				'Activity.statusID' => '1',
			) */
		)
	);
      
}

?>