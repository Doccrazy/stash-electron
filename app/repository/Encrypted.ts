import PlainRepository from './Plain';
import Node, {ROOT_ID} from '../domain/Node';

export default class EncryptedRepository extends PlainRepository {
  async readNode(nodeId: string): Promise<Node> {
    const node = await super.readNode(nodeId);

    if (node.id === ROOT_ID) {
      return new Node({...node, authorizedUsers: ['user1']});
    } else if (node.id === '/Test/') {
      return new Node({...node, authorizedUsers: ['user1', 'priv2']});
    } else {
      return node;
    }
  }
}
