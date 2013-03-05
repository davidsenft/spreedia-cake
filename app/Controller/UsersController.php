<?php
/**
 * User controller.
 *
 * This file will render views from views/users/
 *
 */

App::uses('AppController', 'Controller');

class UsersController extends AppController {

    public $name = 'Users';

    // var $components = array('Auth'); // Not necessary if declared in your app controller

    /**
     *  The AuthComponent provides the needed functionality
     *  for login, so you can leave this function blank.
     */
    function login() {
    }

    function logout() {
        $this->redirect($this->Auth->logout());
    }
}