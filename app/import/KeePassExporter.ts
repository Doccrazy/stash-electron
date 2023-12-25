import * as fs from 'fs-extra';
import * as kdbxweb from 'kdbxweb';
import { typeFor } from '../fileType';

export type ExportNodeId = unknown;

export default class KeePassExporter {
  groupCount = 0;
  entryCount = 0;
  private readonly kdbx: kdbxweb.Kdbx;

  constructor(masterKey: string, name: string) {
    const kdbxCred = new kdbxweb.Credentials(kdbxweb.ProtectedValue.fromString(masterKey), null);
    this.kdbx = kdbxweb.Kdbx.create(kdbxCred, name);
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  createNode(parent: ExportNodeId | null, name: string): ExportNodeId {
    this.groupCount++;
    return this.kdbx.createGroup((parent as kdbxweb.KdbxGroup) || this.kdbx.getDefaultGroup(), name);
  }

  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  async createEntry(parent: ExportNodeId | null, fileName: string, content: Buffer): Promise<void> {
    this.entryCount++;
    const entry = this.kdbx.createEntry((parent as kdbxweb.KdbxGroup) || this.kdbx.getDefaultGroup());

    const type = typeFor(fileName);
    entry.fields.Title = type.toDisplayName(fileName);

    if (type.toKdbxEntry && type.parse) {
      const fields = type.toKdbxEntry(type.parse(content));
      for (const key of Object.keys(fields)) {
        const value = fields[key];
        if (value) {
          entry.fields[key] = key === 'Password' ? kdbxweb.ProtectedValue.fromString(value) : value;
        }
      }
    } else {
      entry.binaries[fileName] = await this.kdbx.createBinary(content.buffer);
      entry.icon = kdbxweb.Consts.Icons.Disk;
    }
  }

  async save(databasePath: string): Promise<void> {
    const data = await this.kdbx.save();
    return fs.writeFile(databasePath, Buffer.from(data));
  }
}
