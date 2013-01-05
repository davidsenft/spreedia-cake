<?php
/**
 * Location model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Post extends AppModel {
	
	public $name = "Post";
	public $displayField = "post_title";
	public $useTable = 'wp_posts';
	public $cacheQueries = false;
	public $primaryKey = 'ID';
	
	public $hasAndBelongsToMany = array(
		'Storeinstance' => array(
			'className'    => 'Storeinstance',
			'joinTable'    => 'posts_storeinstances',
			'foreignKey'   => 'post_id',
			'conditions'   => array('Storeinstance.statusID' => '1')
		)
	);
    
}