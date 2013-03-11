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
	public $scaffold;

	var $helpers = array('Cache', 'Handlebars');
	var $cacheAction = "10 seconds";

	/* public function index(){
		// $this->layout = 'basic';
	} */
	
	public function view($id, $format = 'list'){
		// $this->Api->allowPublic('add'); ????
		$this->layout = 'basic';

		// $this->helpers[] = 'Icon';

		// check that location exists
		$this->Location->id = $id;
		if (!$this->Location->exists() || !$this->Location->isActive())
			throw new NotFoundException(__('Whoa there bud, that is NOT a location!'));
		
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
		$children = getChildrenRecursive($child);
		$this->set('children', $children);

		// parent info
		$parent = $loc['Location']['parent'] ? $loc['Parent'] : false;
		$this->set('parent', $parent);

		// icon info
		$Icon = ClassRegistry::init('Icon');
		$icons = $Icon->find("all");
		$iconkeys = array_flip(array_map(function($i){return $i['Icon']['id'];},$icons));
		foreach ($icons as $key=>$val){
			$icons[$key]['Stores'] = array();}
		$this->set('icons', $icons);

		// store and activity info
		$Storename = ClassRegistry::init('Storename');
		$storeinstances = getStoreInstancesRecursive($loc);
		$storenameids = array();
		$storeinstanceids = array();
		foreach($storeinstances as $si){
			$storeinstanceids[] = $si['id'];
			$storenameids[] = $si['storename_id'];}
		// $Storename->recursive = 2;
		$storenames = $Storename->find("all", array(
			'conditions' => array('Storename.id' => $storenameids)));
		$superstorenames = array();
		// $activity = array();
		foreach ($storenames as $sn){
			$ssn = $sn;
			$ssn['Localinstance'] = array();
			foreach ($sn['Storeinstance'] as $si){
				// determine if store instance is local
				if ($si['location_id'] == $id){
					$si['locationName'] = $location['name'];
					$ssn['Localinstance'][] = $si;
				}else if(array_key_exists($si['location_id'], $children)){
					$si['locationName'] = $children[$si['location_id']]['name'];
					$ssn['Localinstance'][] = $si;
				}else break;
				// save local store in icon array
				foreach ($sn['Icon'] as $sni){ // todo: do this process only once per sn?
					$iconkey = $iconkeys[$sni['id']];
					$icons[$iconkey]['Stores'][] = $sn['Storename']['id']; // storeinstanceid instead?
				}
				// add local activity, if any
				// debug($sn);
			}
			$superstorenames[] = $ssn;
		}
		$this->set('stores', $superstorenames);
		// debug($superstorenames);

		// activity ORRRRR ONLY DO THIS CLIENT SIDE?
		$Activestorename = ClassRegistry::init('Activestorename');
		$activestorenames = $Activestorename->find("all", array(
			'conditions' => array('Activestorename.storename_id' => $storenameids)));
		$Activestoreinstance = ClassRegistry::init('Activestoreinstance');
		$activestoreinstances = $Activestoreinstance->find("all", array(
			'conditions' => array('Activestoreinstance.storeinstance_id' => $storeinstanceids)));
		// debug($activestoreinstances);

		// prices <-> priceranges TODO: MAYBE NOT NECESSARY? JUST HARD CODE THESE?
		$Price = ClassRegistry::init('Price');
		$prices = $Price->find("all");
		$this->set('prices', $prices);
		// debug($prices);
	
		// set metas and page header stuff
		$page = array(
			'type' => "manystores", // as opposed to a single "store" TODO: not using this yet... remove?
			'title' => $loc['Location']['name'],
			'seotitle' => $loc['Location']['name'] . ' | Spreedia',
			'format' => $format
		);
		$this->set('page', $page);

		// serialize for json/ajax
		$this->set('_serialize', array('location', 'children', 'icons', 'stores', 'prices', 'page'));
		
	}

}
