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
	public $cacheAction = true;

	public function view($id, $format = 'list'){
		$this->layout = 'basic';

		// store info
		$this->Storeinstance->recursive = 2; // TODO: contain, e.g. no need for "fromstore"
		$store = $this->Storeinstance->read(null, $id);

		// location info
		list($city,$top) = getCityAndTop($store['Location']);
		$store['Location']['City'] = $city; 
		$store['Location']['Top'] = $top;
		$this->set('store', $store);
		// debug($store);

		// set metas and page header stuff
		$page = array(
			'type' => "singlestore", // not using this yet
			'title' => $store['Storename']['name'].' ('.$store['Location']['name'].')',
			'seotitle' => $store['Storename']['name'].' ('.$store['Location']['name'].') | Spreedia',
			'format' => $format
		);
		$this->set('page', $page);

		// serialize for json/ajax
		$this->set('_serialize', array('store','page'));

		// format as list, map, or external js
        $this->formatView($store, $page, $format);
	}

    protected function setDataForView($store, $page){
        $Icon = ClassRegistry::init('Icon');
        $icons = $Icon->find("all");

        $this->set('store', $store);
		$this->set('icons', $icons);
		$this->set('page', $page);
		$this->set('_serialize', array('store', 'icons', 'page'));
    }

}