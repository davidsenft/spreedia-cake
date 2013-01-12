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

	public $components = array('RequestHandler'); 
	// public $helpers = array('Icon');
	
	public function view($id){
		// $this->Api->allowPublic('add'); ????
		$this->layout = 'spreediaguide';

		// $this->helpers[] = 'Icon';

		// check that location exists
		$this->Location->id = $id;
		if (!$this->Location->exists() || !$this->Location->isActive())
			throw new NotFoundException(__('Whoa there bud, that is NOT a location!'));

		// get icon info
		$Icon = ClassRegistry::init('Icon');
		$icons = $Icon->find("all");
		$this->set('icons', $icons);
		// debug($icons);
		
		// recursion/containment (allows only 3 nested locations)
		$this->Location->recursive = 2;
		$this->Location->contain(array(
			'Parent.Parent',
			'Parent.Parent.Parent',
			'Child',
			'Child.Child',
			'Storeinstance',
			// 'Storeinstance.Storename',
			'Child.Storeinstance',
			// 'Child.Storeinstance.Storename',
			'Child.Child.Storeinstance'
			// 'Child.Child.Storeinstance.Storename'
		));
		
		// location info
		$loc = $this->Location->read(null, $id);
		list($city,$top) = getCityAndTop($loc); // TODO turn these into collections rather than just names?
		$location = $loc['Location'];
		$location['City'] = $city; 
		$location['Top'] = $top;
		$this->set('location', $location);

		// children info
		$child = $loc['Child'];
		$childids = getChildrenRecursive($child);
		// debug($childids);

		// parent info
		$parent = $loc['Location']['parent'] ? $loc['Parent'] : false;
		$this->set('parent', $parent);

		// store info
		$Storename = ClassRegistry::init('Storename');
		$storeinstances = getStoreInstancesRecursive($loc);
		$storenameids = array();
		foreach($storeinstances as $si){$storenameids[] = $si['storename_id'];}
		$storenames = $Storename->find("all", array(
			'conditions' => array('Storename.id' => $storenameids)
		));
		// debug($storenames);

		// indicate which store instances are local
		$superstorenames = array();
		foreach ($storenames as $sn){
			$ssn = $sn;
			$ssn['Localinstance'] = array();
			foreach ($sn['Storeinstance'] as $si){
				if ($si['location_id'] == $id || in_array($si['location_id'], $childids)){
					$ssn['Localinstance'][] = $si;
				}
			}
			$superstorenames[] = $ssn;
		}
		$this->set('stores', $storenames);

		// debug(gettype($storenames));
		// debug(gettype($superstorenames));
		$this->set('stores', $superstorenames);
	    		
		// set metas and page header stuff
		$this->set('title_for_layout', $loc['Location']['name'] . ' | Spreedia');

		$this->set('_serialize', array('location', 'icons', 'stores'));
		
	}

}
