import { TLVDatabase, TLVDatabaseEntry, TLV, TLVParser } from '.';
import { ByteArray } from '@cryptographix/sim-core';

function buildTLVInfos(tlvDatabase: TLVDatabase, bytes: ByteArray, encoding: number, expandDepth: number) {

  let tlvInfos = new Array<TLVInfo>();

  if (bytes.length) {
    let parser: TLVParser = new TLVParser(bytes, { encoding: encoding });

    while (!parser.atEOF) {
      let tlv = parser.nextTLV();
      if (!tlv)
        throw new Error("Invalid TLV Data");

      tlvInfos.push(new TLVInfo(tlvDatabase, tlv, encoding, expandDepth - 1));
    }
  }

  return tlvInfos;
}

export class RootTLVInfo {
  private rootBytes: ByteArray;

  encoding: number;
  expandDepth: number;

  public get bytes(): ByteArray {
    return this.rootBytes;
  }
  public set bytes(bytes: ByteArray) {
    this.rootBytes = bytes || new ByteArray();

    this.childTLVInfos = buildTLVInfos(this.tlvDatabase, this.rootBytes, this.encoding, this.expandDepth)
  }

  public tlvDatabase: TLVDatabase;

  public childTLVInfos: Array<TLVInfo>;

  constructor(tlvDatabase: TLVDatabase, bytes?: ByteArray, encoding: number = TLV.Encodings.EMV) {
    this.tlvDatabase = tlvDatabase;

    this.encoding = encoding;

    this.bytes = bytes;
  }
}

export class TLVInfo {
  public tlv: TLV;
  public entry: TLVDatabaseEntry;

  public childTLVInfos: Array<TLVInfo>;

  constructor(tlvDatabase: TLVDatabase, tlv: TLV, encoding: number, expandDepth: number) {
    this.tlv = tlv;
    this.entry = tlvDatabase.findTag(tlv.tag);
    this.childTLVInfos = new Array<TLVInfo>();

    let tag: number = tlv.tag;
    if (tag > 255) tag >>= 8;

    if ((expandDepth > 0) && (tag & 0x20)) {
      this.childTLVInfos = buildTLVInfos(tlvDatabase, <any>tlv.value, encoding, expandDepth - 1)
    }
  }
}
