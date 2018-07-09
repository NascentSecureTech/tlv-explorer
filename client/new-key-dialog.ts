import {DialogController} from 'aurelia-dialog';

export class NewKeyDialog {
  static inject = [DialogController];
  key;

  controller:DialogController;

  constructor(controller:DialogController){
    this.controller = controller;
  }

  activate(key: any){
    this.key = Object.assign( {}, key );
  }
}
