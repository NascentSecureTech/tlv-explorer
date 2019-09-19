import {DialogService} from 'aurelia-dialog';
import {NewKeyDialog} from '../tools/key-manager/new-key-dialog';

import './header-bar.scss';

export class HeaderBar {
  message = 'Hello Mundo!';
  static inject = [DialogService];

  dialogService:DialogService;
  constructor(dialogService) {
    this.dialogService = dialogService;
  }

  static key: {
    keyType: string;
  } = {
    keyType: "PUBLIC"
  };

  newDropDown: boolean;
  toggleNewDropdown( showDropDown: boolean ) {
    this.newDropDown = showDropDown;
  }

  newAction() {
    this.dialogService.open({ viewModel: NewKeyDialog, model: HeaderBar.key, lock: false }).whenClosed(response => {
      if (!response.wasCancelled) {
        console.log('good - ', response.output);

        HeaderBar.key = Object.assign( {}, response.output );
      } else {
        console.log('bad');
      }
      console.log(response.output);
    });
  }
}
