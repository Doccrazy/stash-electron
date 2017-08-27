export function parse(contentBuffer) {
  if (contentBuffer instanceof Buffer) {
    return JSON.parse(contentBuffer.toString());
  }
}

export function write(parsedContent) {
  return Buffer.from(JSON.stringify(parsedContent || {}, null, '  '));
}
