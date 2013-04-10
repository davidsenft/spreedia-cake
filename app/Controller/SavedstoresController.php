<?php
/**
 * User<->Storename (saved favorites) controller.
 */

App::uses('AppController', 'Controller');

class SavedstoresController extends AppController {

	public $name = 'Savedstores';
	public $scaffold;

	// var $helpers = array('Cache');
	// var $cacheAction = "10 seconds";

	public function add(){ /* $user_id, $storename_id */
		$this->Savedstore->create();
		$this->Savedstore->save($this->request->data);
		$this->respond($this->Savedstore->id);
	}

	public function delete(){
		$id = $this->request->data;
		$this->Savedstore->delete($id);
		$this->respond($id['id']);
	}

	// TODO: this can just be "view"? or is this actually better as its own thing?
	/* public function getStorenamesByUserId($userid){

		// get the user
		// TODO: probably better to put this in the User controller
		$User = ClassRegistry::init('User');
		$usr = $User->findById($userid);

		// get saved stores by user id
		// TODO: faster to use findById with ids from User now that we have them?
		$this->Savedstore->recursive = 2; // superfluous right now
		$this->Savedstore->unbindModel(array('belongsTo' => array('User')));
		$savedstores = $this->Savedstore->findAllByUserId($userid);
		
		// trim to savedstore_id => storename
		$trimsavedstores = array();
		foreach($savedstores as $ss){
			$trimsavedstores[$ss['Savedstore']['id']] = $ss['Storename'];
		}

		// page data
		$page = array(
			'type' => "manystores", // as opposed to a single "store" TODO: not using this yet... remove? or probably make it "location"
			'title' => $usr['User']['username'] . "'s favorite stores",
			'seotitle' => $usr['User']['username'] . "'s favorite stores | Spreedia",
			'format' => 'TODO'
		);

		// $this->respond($trimsavedstores);

		$this->set('stores', $trimsavedstores);
		$this->set('page', $page);
		$this->set('_serialize', array('stores', 'page'));
	} */

}