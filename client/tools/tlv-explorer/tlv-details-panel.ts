import {BindingEngine, autoinject, bindable, ICollectionObserverSplice} from 'aurelia-framework';
import { TLVInfo } from './tlv-database/mod';

@autoinject
export class TLVDetailsPanel {

  @bindable tlvInfo: TLVInfo;

  tlvInfoChanged() {
    this.tvrBit.splice(0);

    for( let i = 0; i < 5; ++i ) {
      for( let j = 0; j < 8; ++j ) {
        let val = this.tlvInfo.tlv.value.byteAt( i ) & ( 1 << (7-j) );
        if ( val )
          this.tvrBit.push( i*8 + j );
        }
    }
  }

  bitNames = {
    0: [
        "Cash",
        "Goods",
        "Services",
        "Cashback",
        "Inquiry",
        "Transfer",
        "Payment",
        "Administrative",
    ],
    1: [
        "RFU",
        "RFU",
        "RFU",
        "RFU",
        "RFU",
        "RFU",
        "RFU",
        "RFU",
    ],
    2: [
        "Numeric Keys",
        "Alphabetic Keys",
        "Command Keys",
        "Function Keys",
        "RFU",
        "RFU",
        "RFU",
        "RFU",
    ],
    3: [
        "Print, attendant",
        "Print, cardholder",
        "Display, attendant",
        "Display, cardholder",
        "RFU",
        "RFU",
        "Code Table 10",
        "Code Table 9",
    ],
    4: [
      "Code Table 8",
      "Code Table 7",
      "Code Table 6",
      "Code Table 5",
      "Code Table 4",
      "Code Table 3",
      "Code Table 2",
      "Code Table 1",
    ],
  };

  tvrBit: number[] = [];
  bitToIndex( i, j ): number {
    return i*8 + j;
  }

  @bindable
  updateCounter: number = 0;

  hasBit( i,j ) {
    return this.tvrBit.indexOf( this.bitToIndex(i,j) ) >= 0;
  }

  collectionChanged(splices: Array<ICollectionObserverSplice<boolean>>) {
    this.updateCounter++;

    for (var i = 0; i < splices.length; i++) {
      var splice: ICollectionObserverSplice<boolean> = splices[i];

      var valuesAdded = this.tvrBit.slice(splice.index, splice.index + splice.addedCount);
      if (valuesAdded.length > 0) {
        console.log(`The following values were inserted at ${splice.index}: ${JSON.stringify(valuesAdded)}`);
      }

      if (splice.removed.length > 0) {
        console.log(`The following values were removed from ${splice.index}: ${JSON.stringify(splice.removed)}`);
      }
    }
  }

  tvrBitChanged(newValue/*, oldValue*/ ) {
    console.log( "changed" + newValue );
  }

  constructor(private bindingEngine: BindingEngine) {
    /*let subscription = */this.bindingEngine.collectionObserver(this.tvrBit)
      .subscribe(this.collectionChanged.bind(this));
  }

  selectedTab = 0;
}
