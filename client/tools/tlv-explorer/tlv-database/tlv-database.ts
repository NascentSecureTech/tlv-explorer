import { TLVDatabaseEntry } from './tlv-database-entry';

export class TLVDatabase {
  databaseEntries: Array<TLVDatabaseEntry>;

  constructor() {
    this.databaseEntries = new Array<TLVDatabaseEntry>();
  }

  findTag(tag: number): TLVDatabaseEntry {
    return this.databaseEntries.find((entry) => (entry.tag == tag));
  }
}
