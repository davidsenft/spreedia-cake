<?php
/**
 * Store model for Spreedia.
 */

App::uses('AppModel', 'Model');

class Icon extends AppModel {
	
	public $name = "Icon";
    public $order = "Icon.nickname ASC";
	
	public $hasAndBelongsToMany = array(
        /* 'Storename' => array(
            'className'    => 'Storename'
        ), */
        /* 'Storeinstance' => array(
            'className'    => 'Storeinstance'
        ) */
    );
	
}