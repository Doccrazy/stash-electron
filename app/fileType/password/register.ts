import { register } from '../index';
import Form from './Form';
import PasswordType from './index';
import Panel from './Panel';
import NameLabel from './NameLabel';

register(PasswordType, {
  NameLabel,
  Panel,
  Form
});
