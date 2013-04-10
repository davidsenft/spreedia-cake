<?php
/**
 * User<->Storename model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Savedstore extends AppModel {

	public $name = "Savedstore";
	public $actsAs = array('Containable');
	public $recursive = 2;

	// var $cacheQueries = false;

	public $belongsTo = array('Storename', 'User');

}