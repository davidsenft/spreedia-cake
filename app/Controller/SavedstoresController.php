<?php
/**
 * User<->Storename (saved favorites) controller.
 */

App::uses('AppController', 'Controller');

class SavedstoresController extends AppController {

	public $name = 'Savedstores';
	public $scaffold;

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

}