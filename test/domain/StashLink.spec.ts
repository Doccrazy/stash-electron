import { expect } from 'chai';
import 'mocha';
import StashLink from '../../app/domain/StashLink';

/* tslint:disable:no-unused-expression */

it('parses links correctly', () => {
  expect(StashLink.parse('stash://')).to.deep.eq(new StashLink('/'));
  expect(StashLink.parse('stash://test.enc')).to.deep.eq(new StashLink('/', 'test.enc'));
  expect(StashLink.parse('stash://node/test.enc')).to.deep.eq(new StashLink('/node/', 'test.enc'));
  expect(StashLink.parse('stash://node1/node2/test.enc')).to.deep.eq(new StashLink('/node1/node2/', 'test.enc'));
  expect(StashLink.parse('stash://node1/node2/')).to.deep.eq(new StashLink('/node1/node2/'));
  expect(StashLink.parse('stash://Test/Some%25%20Cr@zy%20N&me!.pass.json')).to.deep.eq(
    new StashLink('/Test/', 'Some% Cr@zy N&me!.pass.json')
  );
});

it('parses legacy links', () => {
  expect(StashLink.parse('stash:///node1/node2/test.enc')).to.deep.eq(new StashLink('/node1/node2/', 'test.enc'));
  expect(StashLink.parse('stash:/node1/node2/test.enc')).to.deep.eq(new StashLink('/node1/node2/', 'test.enc'));
  expect(StashLink.parse('stash:///node1/node2/')).to.deep.eq(new StashLink('/node1/node2/'));
  expect(StashLink.parse('stash:/node1/node2/')).to.deep.eq(new StashLink('/node1/node2/'));
});

it('encodes links correctly', () => {
  expect(new StashLink('/').toUri()).to.eq('stash://');
  expect(new StashLink('/', 'test.enc').toUri()).to.eq('stash://test.enc');
  expect(new StashLink('/node/', 'test.enc').toUri()).to.eq('stash://node/test.enc');
  expect(new StashLink('/node1/node2/', 'test.enc').toUri()).to.eq('stash://node1/node2/test.enc');
  expect(new StashLink('/node1/node2/').toUri()).to.eq('stash://node1/node2/');
  expect(new StashLink('/Test/', 'Some% Cr@zy N&me!.pass.json').toUri()).to.eq('stash://Test/Some%25%20Cr@zy%20N&me!.pass.json');
});

it('detects node and entry links', () => {
  expect(StashLink.parse('stash://').isEntry()).to.be.false;
  expect(StashLink.parse('stash://').isNode()).to.be.true;
  expect(StashLink.parse('stash://node1/node2/').isEntry()).to.be.false;
  expect(StashLink.parse('stash://node1/node2/').isNode()).to.be.true;
  expect(StashLink.parse('stash://node/test.enc').isEntry()).to.be.true;
  expect(StashLink.parse('stash://node/test.enc').isNode()).to.be.false;
});
