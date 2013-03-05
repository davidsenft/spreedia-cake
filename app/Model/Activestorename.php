<?php
/**
 * Activity<->Storename model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Activestorename extends AppModel {

	public $name = "Activestorename";

	var $cacheQueries = false;

	public $belongsTo = array('Activity', 'Storename');

}