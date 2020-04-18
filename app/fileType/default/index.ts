import { Type } from '../index';

const DefaultType: Type<void> = {
  id: 'default',
  test: () => 0,
  toDisplayName: (name) => name,
  toFileName: (name) => name
};

export default DefaultType;
