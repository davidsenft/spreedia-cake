<?php
/**
 * Storeinstance controller.
 *
 * This file will render views from views/storeinstances/
 *
 */

App::uses('AppController', 'Controller');

class StoreinstancesController extends AppController {

	var $name = 'Storeinstances';
	var $helpers = array('Html', 'Form');
	// public $scaffold;
	// public $cacheAction = true;

	public function view($id, $format = 'clean'){

		// store info
		$this->Storeinstance->recursive = 2; // TODO: contain, e.g. no need for "fromstore"
		$store = $this->Storeinstance->read(null, $id);

		// set metas and page header stuff
		$page = array(
			'datatype' => "storeinstance",
			// 'id' => $store['Storename']['id'], // NOTE: that this is storename and not storeinstance (for hearting)
			'listingtype' => "single",
			'title' => $store['Storename']['name'].' ('.$store['Location']['name'].')',
			'seotitle' => $store['Storename']['name'].' ('.$store['Location']['name'].') | Spreedia',
			'format' => $format
		);

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