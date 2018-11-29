import * as fs from 'fs-extra';
import * as kdbxweb from 'kdbxweb';
import { KeePassFields } from '../fileType';
import PasswordType from '../fileType/password';
import { cleanFileName } from '../utils/repository';

export interface Callbacks<T> {
  createNode(parent: T, name: string): Promise<T>
  createEntry(parent: T, fileName: string, content: Buffer): Promise<void>
  progress(message: string): void
}

export interface Credentials {
  masterKey?: string
  keyFile?: string
}

export default class KeePassImporter<T> {
  groupCount = 0;
  entryCount = 0;

  constructor(private databasePath: string, private credentials: Credentials, private callbacks: Callbacks<T>) {
  }

  async performImport(targetNode: T) {
    this.groupCount = 0;
    this.entryCount = 0;

    const dataBuffer = await fs.readFile(this.databasePath);
    const keyFileBuffer = this.credentials.keyFile ? await fs.readFile(this.credentials.keyFile) : null;

    const credentials = new kdbxweb.Credentials(this.credentials.masterKey ? kdbxweb.ProtectedValue.fromString(this.credentials.masterKey) : null,
      keyFileBuffer ? keyFileBuffer.buffer : null);
    const kdbx = await kdbxweb.Kdbx.load(dataBuffer.buffer, credentials);

    return this.importGroup(kdbx, kdbx.getDefaultGroup(), targetNode);
  }

  private async importGroup(kdbx: kdbxweb.Kdbx, group: kdbxweb.KdbxGroup, targetNode: T) {
    this.groupCount++;
    this.callbacks.progress(`Importing group ${group.name}`);

    for (const childGroup of group.groups) {
      if (childGroup.uuid.equals(kdbx.meta.recycleBinUuid)) {
        continue;
      }

      // sanitize name
      const safeName = cleanFileName(childGroup.name, '_').trim();
      const childNode = await this.callbacks.createNode(targetNode, safeName);

      await this.importGroup(kdbx, childGroup, childNode);
    }

    let nameCtr = 1;
    for (const entry of group.entries) {
      this.entryCount++;

      // sanitize name
      const safeName = cleanFileName(entry.fields.Title || `Unnamed ${nameCtr++}`, '_').trim();

      // transform content
      const { Password, ...entryFields } = entry.fields;
      if (entry.fields.Password) {
        entryFields.Password = entry.fields.Password.getText();
      }
      if (PasswordType.isValidKdbxEntry(entryFields as KeePassFields)) {
        const passwordContent = PasswordType.fromKdbxEntry(entryFields as KeePassFields);
        const buffer = PasswordType.write(passwordContent);

        await this.callbacks.createEntry(targetNode, PasswordType.toFileName(safeName), buffer);
      }

      // process binary attachments
      for (const binaryName of Object.keys(entry.binaries)) {
        this.entryCount++;

        const safeBinaryName = cleanFileName(binaryName, '_').trim();
        const binary = entry.binaries[safeBinaryName];

        // WTF API
        let data: ArrayBuffer;
        if (binary instanceof kdbxweb.ProtectedValue) {
          data = binary.getBinary();
        } else if (binary instanceof ArrayBuffer) {
          data = binary;
        } else {
          data = binary.value;
        }

        await this.callbacks.createEntry(targetNode, safeName === safeBinaryName ? safeName : `${safeName} - ${safeBinaryName}`, Buffer.from(data));
      }
    }
  }
}
