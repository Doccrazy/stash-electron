export function parse(contentBuffer: Buffer): any {
  if (contentBuffer instanceof Buffer) {
    return JSON.parse(contentBuffer.toString());
  }
}

export function write(parsedContent: any): Buffer {
  return Buffer.from(JSON.stringify(parsedContent || {}, null, '  '));
}
