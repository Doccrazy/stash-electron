export default function parse(contentBuffer) {
  if (contentBuffer instanceof Buffer) {
    let parse2 = JSON.parse(contentBuffer.toString());
    console.log(parse2);
    return parse2;
  }
}
