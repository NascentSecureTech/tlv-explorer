import { bindable } from 'aurelia-framework';
import { ByteArray } from '@cryptographix/sim-core';

export class ByteInputPane {
  @bindable()
  parseError: string;

  @bindable()
  inputData: string;

  @bindable()
  bytes: ByteArray = new ByteArray();

  inputDataChanged(newValue: string) {
    try {
      this.bytes = new ByteArray(newValue, ByteArray.HEX);
      this.parseError = null;
    }
    catch (E) {
      this.bytes = new ByteArray();
      this.parseError = "INVALID HEX";
      return;
    }

  }
}
