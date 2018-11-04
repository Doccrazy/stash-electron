import * as React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import generatePassword from '../../utils/generatePassword';
import '../../components/shared/StrengthMeter.scss';

const LENGTHS = [8, 12, 16, 20, 24];
const CLASS_NAMES = ['Aa9', '+#_', '" :'];
const CLASSES = [['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '1234567890'], ['!$%&/()+*-_#.,;<>?@[]'], ['"\'\\:=`´^°|~{} ']];

function generatePw(len: number, charClassIdx: number) {
  let classSet: string[] = [];
  CLASSES.forEach((cls, idx) => {
    if (idx <= charClassIdx) {
      classSet = [...classSet, ...cls];
    }
  });

  return generatePassword(len, classSet);
}

export interface Props {
  onGenerate: (pw: string) => void
}

export default ({ onGenerate }: Props) => (
  <UncontrolledDropdown tag="span">
    <DropdownToggle title="Generate password" tabIndex={-1}>
      <i className="fa fa-cog" />
    </DropdownToggle>
    <DropdownMenu right>
      <table>
        <thead>
          <tr>
            <th />
            {LENGTHS.map(len => (<th key={len} className="text-center">{len}</th>))}
          </tr>
        </thead>
        <tbody>
          {CLASS_NAMES.map((cls, cIdx) => (<tr key={cls}>
            <th className="text-center">{cls}</th>
            {LENGTHS.map((len, lIdx) => (<td key={len}>
              <button type="button" className={`btn btn-sm str-${cIdx}-${lIdx}`} onClick={() => onGenerate(generatePw(len, cIdx))}>
                <i className="fa fa-cog" />
              </button>
            </td>))}
          </tr>))}
        </tbody>
      </table>
    </DropdownMenu>
  </UncontrolledDropdown>
);
