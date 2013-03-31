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

	// $this->Api->allowPublic('add'); ????

	/* ******************************************************************** */
	/* API VIEWS */
	/* ******************************************************************** */
	
	public function view($id = false, $format = 'list'){
		// TODO: format for list, map no longer needed? but js is still needed? or use .js instead of /js? but that's not cacheing correctly. damn.
		// TODO: if id is false, just use user's location? necessary?

		// load location if it exists
		$this->Location->id = $id;
		if ($id != false && (!$this->Location->exists() || !$this->Location->isActive()))
			throw new NotFoundException(__('Whoa there bud, that is NOT a location!'));
		$loc = $this->getContained($id);

		// set metas and page header stuff
		$page = array(
			'type' => "manystores", // as opposed to a single "store" TODO: not using this yet... remove? or probably make it "location"
			'title' => $loc['Location']['name'],
			'seotitle' => $loc['Location']['name'] . ' | Spreedia',
			'format' => $format
		);

		// format as list, map, or external js
		$this->formatView($loc, $page, $format);
	}

	public function near($lat, $lng, $dist, $format){

		$this->Location->findNear($lat, $lng, $dist);

	}

	/* ******************************************************************** */
	/* PRIVATE HELPERS */
	/* ******************************************************************** */

	private function formatView($loc, $page, $format){
		if ($format == 'js'){
			// initial external js data load (cacheable as html)
			$this->RequestHandler->renderAs($this, 'js');
			$this->setDataForView($loc, $page);

		}else if ($this->RequestHandler->responseType() == 'json'){
			// subsequent ajax json requests (not cached)
			// TODO: would be faaaannnnntastic if these could be cached 
			// (would also make /js url and $format unnecessary)
			$this->setDataForView($loc, $page);

		}else{
			$this->layout = 'basic';
			$this->set('page', $page);
		}
	}

	private function getContained($id){
		// TODO: move this to Location model somehow?
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

			// 'Storeinstance.Storename',
			// 'Child.Storeinstance.Storename',
			// 'Child.Child.Storeinstance.Storename'
		));
		
		// location info
		$loc = $this->Location->read(null, $id);
		return $loc;
	}

	private function setDataForView($loc, $page){

		// TODO: Allllllll of this shit should be moved to the Location Model

		$id = $loc['Location']['id'];

		// get extended location info
		$location = $this->Location->extendLocation($loc); // TODO: some way to do this without passing loc?
		
		// children info
		$child = $loc['Child'];
		$children = $this->Location->recursiveChildren($child);

		// parent info TODO: necessary?
		// $parent = $loc['Location']['parent'] ? $loc['Parent'] : false;
		// $this->set('parent', $parent);

		// icon info
		$Icon = ClassRegistry::init('Icon');
		$icons = $Icon->find("all");
		$iconkeys = array_flip(array_map(function($i){return $i['Icon']['id'];},$icons));
		foreach ($icons as $key=>$val){
			$icons[$key]['Stores'] = array();}

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
				// TODO: add local activity, if any
				// debug($sn);
			}
			$superstorenames[] = $ssn;
		}

		// activity ORRRRR ONLY DO THIS CLIENT SIDE?
		$Activestorename = ClassRegistry::init('Activestorename');
		$activestorenames = $Activestorename->find("all", array(
			'conditions' => array('Activestorename.storename_id' => $storenameids)));
		$Activestoreinstance = ClassRegistry::init('Activestoreinstance');
		$activestoreinstances = $Activestoreinstance->find("all", array(
			'conditions' => array('Activestoreinstance.storeinstance_id' => $storeinstanceids)));

		// prices <-> priceranges TODO: MAYBE NOT NECESSARY? JUST HARD CODE THESE?
		$Price = ClassRegistry::init('Price');
		$prices = $Price->find("all");

		// set view vars and serialize for json/ajax
		$this->set('location', $location);
		$this->set('children', $children);
		$this->set('icons', $icons);
		$this->set('stores', $superstorenames);
		$this->set('prices', $prices);
		$this->set('page', $page);
		$this->set('_serialize', array('location', 'children', 'icons', 'stores', 'prices', 'page'));
		
	}

}
