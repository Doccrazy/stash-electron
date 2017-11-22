import { expect } from 'chai';
import 'mocha';
import * as sinon from 'sinon';
import { withStubbed } from '../utils/mock';
import * as Credentials from '../../app/actions/credentials';
import * as Settings from '../../app/actions/settings';
import configureStore from '../../app/store/configureStore.test';
import { onceAfterAction } from '../../app/store/eventMiddleware';

describe('actions/credentials', () => {
  let store = configureStore();

  beforeEach(() => {
    store = configureStore();
  });

  it('should return a user-entered credential', async () => {
    const resultPromise = store.dispatch(Credentials.requestCredentials('context', 'Title', 'Text'));

    store.dispatch(Credentials.change({ username: 'foo', password: 'bar' }));
    store.dispatch(Credentials.confirm());

    const result = await resultPromise;
    await store.dispatch(Credentials.acceptCredentials('context'));

    await new Promise(resolve => onceAfterAction(Credentials.Actions.CLOSE, resolve));

    expect(result.username).to.eq('foo');
    expect(result.password).to.eq('bar');
  });

  it('should allow user cancellation', () => {
    const resultPromise = store.dispatch(Credentials.requestCredentials('context', 'Title', 'Text'));

    store.dispatch(Credentials.close());

    return expect(resultPromise).to.be.rejectedWith('cancelled by user');
  });

  it('should allow repeated failed entries', async () => {
    let resultPromise = store.dispatch(Credentials.requestCredentials('context', 'Title', 'Text'));

    store.dispatch(Credentials.change({ username: 'foo', password: 'wrong' }));
    store.dispatch(Credentials.confirm());

    await resultPromise;
    await store.dispatch(Credentials.rejectCredentials('context', 'Error'));

    expect(store.getState().credentials.open).to.be.true;
    expect(store.getState().credentials.error).to.eq('Error');

    resultPromise = store.dispatch(Credentials.requestCredentials('context', 'Title', 'Text'));

    store.dispatch(Credentials.change({ username: 'foo', password: 'correct' }));
    store.dispatch(Credentials.confirm());

    const result = await resultPromise;
    await store.dispatch(Credentials.acceptCredentials('context'));

    await new Promise(resolve => onceAfterAction(Credentials.Actions.CLOSE, resolve));

    expect(result.username).to.eq('foo');
    expect(result.password).to.eq('correct');
  });

  it('should handle 2 concurrent requests', async () => {
    let resultPromise1 = store.dispatch(Credentials.requestCredentials('context1', 'Title', 'Text'));
    const resultPromise2 = store.dispatch(Credentials.requestCredentials('context2', 'Title', 'Text'));

    store.dispatch(Credentials.change({ username: 'foo', password: 'wr0ng' }));
    store.dispatch(Credentials.confirm());

    await resultPromise1;
    await store.dispatch(Credentials.rejectCredentials('context1', 'Error'));

    expect(store.getState().credentials.open).to.be.true;

    resultPromise1 = store.dispatch(Credentials.requestCredentials('context1', 'Title', 'Text'));

    store.dispatch(Credentials.change({ username: 'foo', password: 'bar' }));
    store.dispatch(Credentials.confirm());

    const result1 = await resultPromise1;
    await store.dispatch(Credentials.acceptCredentials('context1'));

    await new Promise(resolve => onceAfterAction(Credentials.Actions.OPEN, resolve));

    store.dispatch(Credentials.change({ username: 'user2', password: 'pw' }));
    store.dispatch(Credentials.confirm());

    const result2 = await resultPromise2;
    await store.dispatch(Credentials.acceptCredentials('context2'));

    await new Promise(resolve => onceAfterAction(Credentials.Actions.CLOSE, resolve));

    expect(result1.username).to.eq('foo');
    expect(result1.password).to.eq('bar');
    expect(result2.username).to.eq('user2');
    expect(result2.password).to.eq('pw');
  });

  it('should immediately return a saved password', async () => {
    await withStubbed('keytar', async keytar => {
      keytar.getPassword.withArgs(sinon.match.any, 'context').returns('{"username": "foo", "password": "bar"}');

      store.dispatch(Settings.changeAndSave('storedLogins', ['context']));

      const result = await store.dispatch(Credentials.requestCredentials('context', 'Title', 'Text'));
      expect(result.username).to.eq('foo');
      expect(result.password).to.eq('bar');
    });
  });

  it('should handle 2 concurrent requests with 1 stored password', async () => {
    await withStubbed('keytar', async keytar => {
      keytar.getPassword.withArgs(sinon.match.any, 'context2').returns('{"username": "u2", "password": "p2"}');

      store.dispatch(Settings.changeAndSave('storedLogins', ['context2']));

      const resultPromise1 = store.dispatch(Credentials.requestCredentials('context1', 'Title', 'Text'));

      const result2 = await store.dispatch(Credentials.requestCredentials('context2', 'Title', 'Text'));
      await store.dispatch(Credentials.acceptCredentials('context2'));

      await new Promise(resolve => setTimeout(resolve));

      expect(store.getState().credentials.open).to.be.true;

      store.dispatch(Credentials.change({ username: 'foo', password: 'bar' }));
      store.dispatch(Credentials.confirm());

      const result1 = await resultPromise1;
      await store.dispatch(Credentials.acceptCredentials('context1'));

      await new Promise(resolve => onceAfterAction(Credentials.Actions.CLOSE, resolve));

      expect(result1.username).to.eq('foo');
      expect(result1.password).to.eq('bar');
      expect(result2.username).to.eq('u2');
      expect(result2.password).to.eq('p2');
    });
  });

  it('should delete and update a saved password', async () => {
    await withStubbed('keytar', async keytar => {
      keytar.getPassword.withArgs(sinon.match.any, 'context').returns('{"username": "foo", "password": "bar"}');

      store.dispatch(Settings.changeAndSave('storedLogins', ['context']));

      const result = await store.dispatch(Credentials.requestCredentials('context', 'Title', 'Text'));
      expect(result.username).to.eq('foo');
      expect(result.password).to.eq('bar');

      await store.dispatch(Credentials.rejectCredentials('context', 'Error'));

      expect(store.getState().settings.current.storedLogins).to.not.include('context');
      expect(keytar.deletePassword.calledWith(sinon.match.any, 'context')).to.be.true;

      const resultPromise = store.dispatch(Credentials.requestCredentials('context', 'Title', 'Text'));

      store.dispatch(Credentials.change({ username: 'foo', password: 'newpw', savePassword: true }));
      store.dispatch(Credentials.confirm());

      const newResult = await resultPromise;
      await store.dispatch(Credentials.acceptCredentials('context'));

      await new Promise(resolve => onceAfterAction(Credentials.Actions.CLOSE, resolve));

      expect(newResult.username).to.eq('foo');
      expect(newResult.password).to.eq('newpw');

      expect(store.getState().settings.current.storedLogins).to.include('context');
      expect(keytar.setPassword.calledWith(sinon.match.any, 'context', '{"username":"foo","password":"newpw"}')).to.be.true;
    });
  });

});
