<?php
/**
 * Storeinstance controller.
 *
 * This file will render views from views/storeinstances/
 *
 */

App::uses('AppController', 'Controller');

class StoreinstancesController extends AppController {

	public $name = 'Storeinstances';
	public $scaffold;

	public function view($id, $format = 'list'){
		$this->layout = 'basic';

		// store info
		$this->Storeinstance->recursive = 2; // TODO: contain, e.g. no need for "fromstore"
		$store = $this->Storeinstance->read(null, $id);

		// location info
		list($city,$top) = getCityAndTop($store['Location']);
		$store['Location']['City'] = $city; 
		$store['Location']['Top'] = $top;
		debug($store);

		// set metas and page header stuff
		$page = array(
			'title' => $store['Storename']['name'].' ('.$store['Location']['name'].')',
			'seotitle' => $store['Storename']['name'].' ('.$store['Location']['name'].') | Spreedia',
			'format' => $format
		);
		$this->set('page', $page);

	}

}
