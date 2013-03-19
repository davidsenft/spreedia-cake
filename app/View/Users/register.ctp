<?php
// debug($this->Session);
echo $this->Session->flash();
echo $this->Session->flash('auth');
$form = $this->Form;
echo $form->create('User', array('action' => 'register'));
echo $form->input('username', array('label' => 'Username / Email Address'));
echo $form->input('pwd-unhashed', array('type' => 'password', 'label' => 'Choose a Password'));
// echo $form->input('pwd-confirm-unhashed', array('type' => 'password', 'label' => 'Password'));
echo $form->end('Register');
?>