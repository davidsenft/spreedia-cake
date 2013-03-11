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
  
    function beforeFilter() {
        // parent::beforeFilter();
        $this->Auth->allow('register');
    }

    function isAuthorized() {
        return true;
    }
      
    function register() {
        
        if (!empty($this->data)) {

            debug($this->data);
            $this->User->create();
            if ($this->User->save($this->data)){
                debug($this->Auth->login($this->data));
                // $this->redirect(array('action' => 'index'));

            }

        }
    }

    function login(){
    }

    function logout(){
        $this->redirect($this->Auth->logout());
    }

    function index(){
        
    }


}