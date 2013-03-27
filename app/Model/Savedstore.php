<?php
/**
 * User<->Storename model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Savedstore extends AppModel {

	public $name = "Savedstore";

	var $cacheQueries = false;

	public $belongsTo = array('Storename', 'User');

}