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
		
		// check validity
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
		
		// get 
		$loc = $this->Location->read(null, $id);
	   	$this->set('location', $loc['Location']);
	   	if ($loc['Location']['parent'])
			$this->set('parent', $loc['Parent']);
		
		// testing isTop
		// $test = $this->Location->getTop();
		// debug($test);
		debug($loc);
			
		// set the stores recursively
		$stores = $loc['Storeinstance'];
		$this->set('stores', $loc['Storeinstance']);
	    		
		// set metas and page header stuff
		$this->set('title_for_layout', $loc['Location']['name'] . ' | Spreedia');
		
	}

}
