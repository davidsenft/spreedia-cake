<?php
/**
 * User controller.
 *
 * This file will render views from views/users/
 *
 */

App::uses('AppController', 'Controller');

class UsersController extends AppController {
    var $name = 'Users';
    var $helpers = array('Html', 'Form');
    public $scaffold;
  
    public function beforeFilter() {
        parent::beforeFilter();
        $this->Auth->allow('register');
    }
      
    public function register() {
        
        if ($this->request->is('post') && !empty($this->data)) {
            // debug($this->data);
            $this->User->create();
            if ($this->User->save($this->request->data)){
                $this->Session->setFlash(__('The user has been saved'));
                // $this->redirect(array('action' => 'index'));
            }else{
                $this->Session->setFlash(__('There was an error while attempting to register'));
            }
                // debug($this->Auth->login($this->data));
                // $this->redirect(array('action' => 'index'));
            // }

        }
    }

    public function login(){
        if ($this->request->is('post')) {
            if ($this->Auth->login()) {
                $this->redirect($this->Auth->redirect());
                $this->Session->setFlash(__('You have been logged in!'));
            } else {
                $this->Session->setFlash(__('Invalid username or password, try again'));
            }
        }
    }

    public function logout(){
        $this->redirect($this->Auth->logout());
    }

    /* public function index(){
        $this->User->recursive = 0;
        $this->set('users', $this->paginate());
    } */

    // TODO: why is we setting id default to null?
    public function view($id = null) {
        $this->User->id = $id;
        if (!$this->User->exists()){throw new NotFoundException(__('Invalid user'));}
        $user = $this->User->read();
        $this->respond($user);
    }

    /* TODO: this maybe should be createHeart() or deleteHeart()

    public function syncHeart($id, $storeid, $status){
        $this->layout = 'ajax';

        $this->User->read(null, $id);
        debug($this->User);
    } */

    public function favorites($id){
        $this->User->id = $id;
        if (!$this->User->exists()){throw new NotFoundException(__('Invalid user'));}
        $this->User->contain(array(
            'Savedstore.Storename' => array(
                'Image',
                'Pricerange',
                'Activestorename',
                'Icon'
            )
        ));
        $user = $this->User->read();
        $this->respond($user); 
        // TODO: change to serializing 'stores' and 'page' like w/ Location?
    }


}