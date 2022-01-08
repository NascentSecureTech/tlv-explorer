import { bindable, autoinject } from 'aurelia-framework';
import { /*Router, */activationStrategy } from 'aurelia-router';
import { TLVDatabase, TLVDatabaseEntry, RootTLVInfo, TLVInfo, TLV } from './tlv-database/mod';
import { ByteArray } from '@cryptographix/sim-core';
import autosize from 'autosize';
import { tags } from './tlv-database/emv-db';

type TLVXMode = "decode" | "encode" | "lookup" | "dol";
type TLVXFormat = "auto" | "ber" | "dgi" | "ctv";

type DataFormat = "auto" | "hex" | "base64" | "text";

@autoinject()
export class TLVExplorer {
  tlvDatabase: TLVDatabase;

  el: Element;

  constructor(el: Element) {
    this.el = el;

    this.tlvDatabase = new TLVDatabase();
    this.rootTLVInfo = new RootTLVInfo(this.tlvDatabase);

    let entries = [];
    Object.keys(tags).forEach( (t:any) => {
      entries.push( new TLVDatabaseEntry(t, tags[t].name, "") );
    } );

    this.tlvDatabase.databaseEntries = this.tlvDatabase.databaseEntries.concat(entries);

    this.refresh();
  }

  determineActivationStrategy() {
    return activationStrategy.invokeLifecycle;
  }

  private refresh() {
    this.tlvInputChanged(this.tlvInput);
  }

  @bindable() mode: TLVXMode;
  @bindable() tlvFormat: TLVXFormat = "ber";
  setTLVFormat(tlvFormat: string) {
    this.tlvFormat = TLVXParams.convertTLVFormat(tlvFormat);
    this.refresh();
  }

  /**
  * Route activation
  *
  * Setup Component from URL params
  **/
  activate(urlParams: any/*, router: Router*/) {
    let params = new TLVXParams(urlParams);

    this.mode = params.mode;
    this.tlvFormat = params.tlvFormat;

    //    console.log(JSON.stringify(params));
  }

  byteInputElement: Element;

  attached() {
    function getAll(selector) {
       return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
     }

    var $dropdowns = getAll('.dropdown:not(.is-hoverable)');

    if ($dropdowns.length > 0) {
      $dropdowns.forEach(function ($el) {
        $el.addEventListener('click', function (event) {
          event.stopPropagation();
          $el.classList.toggle('is-active');
        });
      });

      document.addEventListener('click', function () {
        closeDropdowns();
      });
    }

    function closeDropdowns() {
      $dropdowns.forEach(function ($el) {
        $el.classList.remove('is-active');
      });
    }

    autosize(this.byteInputElement);

    console.log('attach: ' + this.mode);
  }
  bind() {
    console.log('bind: ' + this.mode);
  }

  private parseCTV(value: string): ByteArray {
    this.parseError = undefined;

    let bytes = new ByteArray();
    let off = 0;

    while (off < value.length) {
      if (" \t\n".indexOf(value[off]) >= 0) {
        off++;
        continue;
      }

      let tag = parseInt(value.substr(off, 4), 16);
      off += 4;
      let len = parseInt(value.substr(off, 5));
      off += 5;

      if (off + len > value.length) {
        this.parseError = "INVALID CTV";
        return;
      }

      let val = value.substr(off, len);
      off += len;
      let tlv = new TLV(tag, <any>new ByteArray(val, ByteArray.UTF8));

      bytes.concat(<any>tlv.byteArray);
    }

    return bytes || bytes;
  }

  private parseHex(hexValue: string): ByteArray {
    this.parseError = undefined;

    let bytes: ByteArray;
    try {
      bytes = new ByteArray(hexValue, ByteArray.HEX);
    }
    catch (E) {
      this.parseError = "INVALID HEX";
      return;
    }

    return bytes;
  }

  @bindable()
  tlvInput: string;

  @bindable()
  dolInput: string;

  @bindable()
  dolBuffer: string;

  @bindable()
  parseError: string;

  @bindable()
  rootTLVInfo: RootTLVInfo;

  private dolProcessor: DOLProcessor = new DOLProcessor();

  private convertTLVInput(newValue: string): ByteArray {
    if (this.tlvFormat == "ctv") {
      return this.parseCTV(newValue);
    }
    else {
      return this.parseHex(newValue);
    }
  }

  processDOL(newValue: string) {
    let bytes = this.convertTLVInput(newValue);

    try {
      this.dolProcessor.tlvBytes = bytes;
    }
    catch (E) {
      this.parseError = "INVALID TLV DATA";
      return;
    }

    try {
      this.dolProcessor.dolToBuffer();

      this.dolBuffer = this.dolProcessor.dataBuffer.toString();
    }
    catch (E) {
      this.parseError = "INVALID DOL DATA";
      return;
    }
  }

  private decodeTLV(newValue: string) {
    switch (this.tlvFormat) {
      case "ber": this.rootTLVInfo.encoding = TLV.Encodings.EMV; break;
      case "dgi": this.rootTLVInfo.encoding = TLV.Encodings.DGI; break;
      case "ctv": this.rootTLVInfo.encoding = TLV.Encodings.EMV; break;
    }

    this.rootTLVInfo.expandDepth = (this.tlvFormat == "ber") ? Infinity : 1;

    let bytes = new ByteArray();

    try {
      bytes = this.convertTLVInput(newValue);
    }
    catch (E) {
      this.rootTLVInfo.bytes = bytes;
      return;
    }

    try {
      this.rootTLVInfo.bytes = bytes;
    }
    catch (E) {
      this.parseError = "INVALID TLV DATA";
      return;
    }

    if ( this.rootTLVInfo.childTLVInfos.length ) {

      this.selectedTLVInfo = this.rootTLVInfo.childTLVInfos[0];

      //new TLVInfo(this.tlvDatabase, tlv, this.rootTLVInfo.encoding, 1);
    }

  }

  selectedTLVInfo: TLVInfo;

  // private doEncode() {
  //
  // }
  @bindable() dataFormat: DataFormat = "hex";
  setDataFormat(dataFormat: string) {
    this.dataFormat = TLVXParams.convertDataFormat(dataFormat);
    this.refresh();
  }

  tlvInputChanged(newValue: string) {

    switch (this.mode) {
      case "decode":
        this.decodeTLV(newValue);
        break;

      case "dol":
        this.processDOL(newValue);
        break;
    }
  }

  private xx(infos: Array<TLVInfo>, indent: number): string {
    let text = "";
    for (let info of infos) {
      text += "  ".repeat(indent);
      text += info.tlv.tagAsHex + " " + info.tlv.lenAsHex;
      if (info.childTLVInfos.length)
        text += "\n" + this.xx(info.childTLVInfos, indent + 1);
      else
        text += " " + info.tlv.value.toString() + "\n";
    }

    return text;
  }

  reformatTLV() {
    let text = this.xx(this.rootTLVInfo.childTLVInfos, 0);
    this.tlvInput = text;
  }
  cleanupTLV() {
    let text = this.xx(this.rootTLVInfo.childTLVInfos, 0);
    this.tlvInput = text.replace(/ /g, '').replace(/\n/g, '');
  }
}

export class DOLProcessor {
  tlvBytes: ByteArray;
  dolBytes: ByteArray;
  dataBuffer: ByteArray;

  dolToBuffer() {
    //let tlvParser = new TLVParser(this.tlvBytes);
    //let dolParser = new TLVParser(this.tlvBytes, { extract: "tl" }); //TLV.Encodings.EMV
  }
}

interface TLVXParamHash {
  mode?: TLVXMode;
  tlvFormat?: TLVXFormat;
  context?: string;
}

export class TLVXParams implements TLVXParamHash {
  mode: TLVXMode;
  tlvFormat: TLVXFormat;
  context: string;

  constructor(params: TLVXParamHash = {}) {
    let defaults: TLVXParamHash = {
      mode: "decode",
      tlvFormat: "ber",
      context: ""
    }

    let xparams = Object.assign({}, defaults, params);

    this.mode = TLVXParams.convertMode(xparams.mode);
    this.tlvFormat = TLVXParams.convertTLVFormat(xparams.tlvFormat);
    this.context = xparams.context || "default";
  }

  static convertMode(value: string): TLVXMode {
    const values: TLVXMode[] = ["decode", "encode", "lookup", "dol"];

    let index = values.indexOf(value.toLowerCase() as TLVXMode);

    return values[index < 0 ? 0 : index];
  }

  static convertTLVFormat(value: string): TLVXFormat {
    const values: TLVXFormat[] = ["auto", "ber", "dgi", "ctv"];

    let index = values.indexOf(value.toLowerCase() as TLVXFormat);

    return values[index < 0 ? 0 : index];
  }

  static convertDataFormat(value: string): DataFormat {
    const values: DataFormat[] = ["auto", "hex", "base64", "text"];

    let index = values.indexOf(value.toLowerCase() as DataFormat);

    return values[index < 0 ? 0 : index];
  }
}
