<?php
/**
 * User<->Storename management model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Managedstore extends AppModel {

	public $name = "Managedstore";

	var $cacheQueries = false;

	public $belongsTo = array('Storename', 'User');

}