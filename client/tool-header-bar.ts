import {DialogService} from 'aurelia-dialog';
import {NewKeyDialog} from './new-key-dialog';

export class ToolHeaderBar {
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

  newAction() {
    this.dialogService.open({ viewModel: NewKeyDialog, model: ToolHeaderBar.key, lock: false }).whenClosed(response => {
      if (!response.wasCancelled) {
        console.log('good - ', response.output);

        ToolHeaderBar.key = Object.assign( {}, response.output );
      } else {
        console.log('bad');
      }
      console.log(response.output);
    });
  }
}
