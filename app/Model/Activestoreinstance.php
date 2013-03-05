<?php
/**
 * Activity<->Storeinstance model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Activestoreinstance extends AppModel {

	public $name = "Activestoreinstance";

	var $cacheQueries = false;

	public $belongsTo = array('Activity', 'Storeinstance');

}