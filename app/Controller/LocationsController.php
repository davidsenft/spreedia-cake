<?php
/**
 * Location controller.
 *
 * This file will render views from views/locations/
 *
 */

App::uses('AppController', 'Controller');

class LocationsController extends AppController {

	public $name = 'Locations';
	// public $scaffold;
	
	public function view($id){
		// $this->layout = 'spreediaguide';
		
		// check location validity
		$this->Location->id = $id;
		if (!$this->Location->exists()) {
			throw new NotFoundException(__('Whoa there bud, that is NOT a location!'));
		}
		
		// recursion/containment (allows only 3 nested locations)
		$this->Location->recursive = 2;
		$this->Location->contain(array(
			'Parent.Parent',
			'Parent.Parent.Parent',
			'Child',
			'Child.Child',
			'Storeinstance',
			'Child.Storeinstance',
			'Child.Child.Storeinstance'
		));
		
		// location info
		$loc = $this->Location->read(null, $id);
		$this->set('location', $loc['Location']);

		// parent info
		$parent = $loc['Location']['parent'] ? $loc['Parent'] : false;
		$this->set('parent', $parent);

		// store info
		$stores = getStoresArrayRecursive($loc);
		$this->set('stores', $stores);
		
		// debug($parent);
	    		
		// set metas and page header stuff
		$this->set('title_for_layout', $loc['Location']['name'] . ' | Spreedia');

		// testing isTop
		// $test = $this->Location->isTop();
		
	}

}
