import * as React from 'react';
import { Button } from 'reactstrap';
import generatePassword from '../../utils/generatePassword';

const LENGTHS = [8, 12, 16, 20, 24];
const CLASS_NAMES = ['Aa9', '+#_', '" :'];
const CLASSES = [['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '1234567890'], ['!$%&/()+*-_#.,;<>?@[]'], ['"\'\\:=`´^°|~{} ']];

function mapColor(cIdx: number, lIdx: number) {
  const t = (cIdx / (CLASSES.length - 1)) + (lIdx / (LENGTHS.length - 1));
  const r = Math.floor(Math.min(255 * t, 255));
  const g = Math.floor(220 - Math.max(220 * (t - 1), 0));
  return `rgb(${r}, ${g}, 0)`;
}

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
  <div className="dropdown" style={{ display: 'inline-block' }}>
    <button type="button" className="btn btn-secondary" data-toggle="dropdown" title="Generate password">
      <i className="fa fa-cog" />
    </button>
    <div className="dropdown-menu dropdown-menu-right">
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
              <Button size="sm" style={{ backgroundColor: mapColor(cIdx, lIdx) }} onClick={() => onGenerate(generatePw(len, cIdx))}>
                <i className="fa fa-cog" />
              </Button>
            </td>))}
          </tr>))}
        </tbody>
      </table>
    </div>
  </div>
);
