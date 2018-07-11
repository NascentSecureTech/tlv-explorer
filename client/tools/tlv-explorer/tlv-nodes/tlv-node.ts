import { bindable } from 'aurelia-framework';
import { TLVInfo, TLVDatabaseEntry} from '../tlv-database';
import * as $ from 'jquery';

export class TLVNodeVM {
  get tag(): string {
    return this.tlvInfo.tlv.tagAsHex;
  }

  get len(): number {
    return this.tlvInfo.tlv.len;
  }

  private get entry() {
    return this.tlvInfo.entry || new TLVDatabaseEntry(0, "Unknown", "");
  }

  get name(): string {
    let entry = this.entry;

    return entry.name;
  }

  type: string = '';

  @bindable tlvInfo: TLVInfo;
  //tlvInfoChanged(newInfo: TLVInfo) {
  //}

  onclick(evt: Event) {
    let el = $(<HTMLElement>evt.currentTarget);

    if (el.hasClass('tree-node-closed')) {
      el.removeClass('tree-node-closed').addClass('tree-node-open')
    } else {
      el.removeClass('tree-node-open').addClass('tree-node-closed')
    }

    evt.preventDefault();
    evt.cancelBubble = true;
  }
}
