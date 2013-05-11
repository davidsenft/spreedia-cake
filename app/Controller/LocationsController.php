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

	var $helpers = array('Cache', 'Handlebars'); // TODO: are we using handlebars?
	var $cacheAction = "10 seconds";

	// $this->Api->allowPublic('add'); ????
	// TODO: REMEMBER WHEN SAVING TO UPDATE RELEVANT CITY REFERENCES

	/* ******************************************************************** */
	/* API VIEWS */
	/* ******************************************************************** */
	
	public function view($id = false, $format = 'list'){
		// TODO: format for list, map no longer needed? but js is still needed? or use .js instead of /js? but that's not cacheing correctly. damn.
		// TODO: instead of passing a format for 'js', use a different action? except, it's kindaa nice that we can use 'map' or 'list' too...
		// TODO: if id is false, just use user's location? necessary?
 
		// load location if it exists
		$this->Location->id = $id;
		// TODO: different error handling for different formats?
		if ($id != false && (!$this->Location->exists() || !$this->Location->isActive()))
			throw new NotFoundException(__('Whoa there bud, that is NOT a location!'));
		$loc = $this->Location->getContained();

		// title TODO: move this to model?
		$title = $loc['Location']['name'];
		if ($loc['Location']['isCity']) $title .= ", " . $loc['Location']['state'];
		if ($loc['Location']['parent']){
			if ($loc['Location']['isCity']) $title .= " (" . $loc['Parent']['name'] . ")";
			else $title .= " (" . $loc['City']['name'] . ", " . $loc['City']['state'] . ")";
		}

		// set metas and page header stuff
		$page = array(
			'datatype' => 'location',
			// 'id' => $loc['Location']['id'],
			'listingtype' => "listing", 
			'title' => /* "Shops in " . */ $title,
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
	/* PROTECTED HELPERS */
	/* ******************************************************************** */

	protected function setDataForView($loc, $page){
		// TODO: move any of this to any Models?
		// TODO: can we bypass some of this faster if location has no children?
		// TODO: some way to do extendLocation or recursiveStoreInstances without passing loc since id has been set?

		// get extended location info including 'City' and 'Top'
		// TODO: move to beforeFind or some shit? probably not.
		// $location = $this->Location->extendLocation($loc);
		$location = $loc['Location'];
		
		// children info
		$child = $loc['Child'];
		$children = $this->Location->recursiveChildren($child);

		// city info
		if (!$location['isCity']) $this->set('city', $loc['City']);
		else $this->set('city',false);

		// parent info TODO: necessary? probably.
		$parent = $loc['Location']['parent'] ? $loc['Parent'] : false;
		$this->set('parent', $parent);

		// icon info
		// TODO: load this in some initial page load, rather than with location
		$Icon = ClassRegistry::init('Icon');
		$icons = $Icon->find("all");

		// recursively get all local storeinstances and storenames
		$storeinstances = $this->Location->recursiveStoreInstances($loc);

		// id arrays for storeinstances and storenames
		$storename_ids = array();
		$storeinstance_ids = array();
		foreach($storeinstances as $si){
			$storeinstance_ids[] = $si['id'];
			$storename_ids[] = $si['storename_id'];
		}

		// get all associated storenames
		$Storename = ClassRegistry::init('Storename');
		// OLD: $Storename->recursive = 2;
		$storenames = $Storename->find("all", array(
			'conditions' => array('Storename.id' => $storename_ids)));

		// activity
		/* $Activestorename = ClassRegistry::init('Activestorename');
		$activestorenames = $Activestorename->find("all", array(
			'conditions' => array('Activestorename.storename_id' => $storename_ids)));
		$Activestoreinstance = ClassRegistry::init('Activestoreinstance');
		$activestoreinstances = $Activestoreinstance->find("all", array(
			'conditions' => array('Activestoreinstance.storeinstance_id' => $storeinstance_ids))); */

		// set view vars and serialize for json/ajax
		// TODO: combine these into $context and use $this->respond($context)?
		// TODO: or at least combine using 'compact'?
		$this->set('location', $location);
		$this->set('children', $children);
		$this->set('icons', $icons);
		$this->set('stores', $storenames);
		$this->set('page', $page);
		$this->set('_serialize', array('location', 'children', 'city', 'parent', 'icons', 'stores', 'page'));
		
	}

}
