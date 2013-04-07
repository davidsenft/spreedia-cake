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
		$loc = $this->Location->getContained();

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
			// TODO: would be nice if cached version were also served as js... .htaccess thing?
			// TODO: make sure serving cached version as html works ok in various browsers
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

	private function setDataForView($loc, $page){
		// TODO: move any of this to any Models?

		// get extended location info 
		// TODO: some way to do this without passing loc?
		$location = $this->Location->extendLocation($loc); 
		
		// children info
		$child = $loc['Child'];
		$children = $this->Location->recursiveChildren($child);

		// parent info TODO: necessary?
		// $parent = $loc['Location']['parent'] ? $loc['Parent'] : false;
		// $this->set('parent', $parent);

		// icon info
		// TODO: load this in some initial page load, rather than with location?
		$Icon = ClassRegistry::init('Icon');
		$icons = $Icon->find("all");
		/* $iconkeys = array_flip(array_map(function($i){return $i['Icon']['id'];},$icons));
		foreach ($icons as $key=>$val){
			$icons[$key]['Stores'] = array();} */

		// store and activity info
		// TODO: can we bypass some of this faster if location has no children?
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

			// $sn is a storename with at least one local instance
			// $ssn will additionally tells us which one(s) it is
			$ssn = $sn;
			$ssn['Localinstance'] = array();
			foreach ($sn['Storeinstance'] as $si){

				// determine if store instance is local
				if ($si['location_id'] == $location['id']){
					$si['locationName'] = $location['name'];
					$islocal = true;
				}else if(array_key_exists($si['location_id'], $children)){
					$si['locationName'] = $children[$si['location_id']]['name'];
					$islocal = true;
				}else $islocal = false;

				if ($islocal){
					// store instance is local, so add it to the list of local instances
					$ssn['Localinstance'][] = $si;
					// TODO: add activity, if any, to list of local activity
				}
			}

			// save storename in local icon array
			/* foreach ($sn['Icon'] as $sni){
				$iconkey = $iconkeys[$sni['id']];
				$icons[$iconkey]['Stores'][] = $sn['Storename']['id'];
			} */

			$superstorenames[] = $ssn;
		}

		// activity TODO: ORRRRR ONLY DO THIS CLIENT SIDE?
		$Activestorename = ClassRegistry::init('Activestorename');
		// $activestorenames = $Activestorename->find("all", array(
		// 	'conditions' => array('Activestorename.storename_id' => $storenameids)));
		$activestorenames = $Activestorename->findAllByStorenameId($storenameids);
		$Activestoreinstance = ClassRegistry::init('Activestoreinstance');
		// $activestoreinstances = $Activestoreinstance->find("all", array(
		// 	'conditions' => array('Activestoreinstance.storeinstance_id' => $storeinstanceids)));
		$activestoreinstances = $Activestoreinstance->findAllByStoreinstanceId($storeinstanceids);

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
