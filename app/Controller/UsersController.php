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
      
  function register() {
    debug($this->Data);
    debug($this->Data['User']['password']);
    debug($this->Auth->password($this->data['User']['password_confirm']));
    if (!empty($this->data)) {
            if ($this->data['User']['password'] == $this->Auth->password($this->data['User']['password_confirm'])) {
                $this->User->create();
                $this->User->save($this->data);
                $this->redirect(array('action' => 'index'));
            }
        }
    }
}