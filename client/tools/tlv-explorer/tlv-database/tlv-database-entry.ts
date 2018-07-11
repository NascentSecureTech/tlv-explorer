export enum EntryType {
  ntNone,
  ntBCD,             ///< N�s \c bcd, utilizados para armazenar d�gitos BCD. (OBS: Tipo At�mico).
  ntBoolean,         ///< N�s \c boolean, utilizados para armazenar valores bin�rios. (OBS: Tipo At�mico).
  ntByte,            ///< N�s \c byte, utilizados para armazenar \c integer, \c byte e valores
  ntElement,         ///< N�s \c element, utilizados para armazenar outros \c element
  ntEnum,
  ntInteger,         ///< N�s \c integer, utilizados para armazenar valores inteiros. (OBS: Tipo At�mico).
  ntString,
  ntType,
  ntTLV,             ///< N�s \c tlv, utilizados para armazenar elementos compostos e tipos at�micos abaixo
}

export enum EntryFlags {
  nfRFU,
  nfDefault,
  nfDeprecated,
  nfReintroduce
}

export class TLVDatabaseEntry {
  public name: string;
  public description: string;

  public typeName: string;
  public dataType: EntryType;

  public typeEntry: TLVDatabaseEntry;    // referenced type, for ntType

  public entryFlags: Set<EntryFlags>;

  tag: number;
  public sizeBits: number;
  public id: number;
  public minBits: number;
  public maxBits: number;

  public value: string;         // for ntEnum

  public childEntries: Array<TLVDatabaseEntry>;

  public constructor(tag: number, name: string, description: string) {

    this.name = name;
    this.description = description;
    this.tag = tag;

    this.dataType = EntryType.ntNone;
    this.entryFlags = new Set<EntryFlags>();
    this.childEntries = new Array<TLVDatabaseEntry>();
  }

  public addChildEntry(childEntry: TLVDatabaseEntry) {
    this.childEntries.push(childEntry);
  }

  public calcEntrySize(): number {
    var sizeBits = this.sizeBits;

    if (sizeBits == 0) {
      if (this.childEntries.length) {
        for (let entry of this.childEntries) {
          sizeBits += entry.calcEntrySize();
        }
      }
      else {
        // default sizes
        switch (this.dataType) {
          case EntryType.ntBCD:
          case EntryType.ntByte:
            sizeBits = 8;
            break;

          case EntryType.ntBoolean:
            sizeBits = 1;
            break;

          case EntryType.ntInteger:
            sizeBits = 4 * 8;
            break;

          default:
            break;
        }
      }
    }

    return sizeBits;
  }

  public toXML(indent: string = ""): string {
    var xml = indent + "<" + this.dataType;

    if (this.typeEntry)
      return this.typeEntry.toXML(indent);

    if (this.sizeBits > 0)
      xml += " size=\"" + this.sizeBits + "\"";
    else
      xml += " size=\"!" + this.calcEntrySize() + "\"";

    if (this.typeName)
      xml += " type=\"" + this.typeName + "\"";
    if (this.description != null)
      xml += " description=\"" + this.description + "\"";

    if (this.typeEntry) {
      xml += "/>\n";
      xml += this.typeEntry.toXML(indent + "  ");
      xml += indent + "</" + this.dataType + ">\n";
    }
    else if (this.childEntries.length == 0) {
      xml += "/>\n";
    }
    else {
      xml += ">\n";

      for (let entry of this.childEntries) {
        xml += entry.toXML(indent + "  ");
      }

      xml += indent + "</" + this.dataType + ">\n";
    }

    return xml;
  }
}
