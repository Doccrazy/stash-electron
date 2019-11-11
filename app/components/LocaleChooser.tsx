import * as React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import * as langmap from 'langmap';

interface Props {
  value: string
  locales: string[]
  onChange: (locale: string) => void
}

const Locale = ({value}: {value: string}) => value ? <span>
  <img src={require(`../locale/${value}.svg`)} style={{ height: '1em', marginTop: '-0.2em' }}/> {langmap[value].nativeName}
</span> : <span/>;

export default ({value, locales, onChange}: Props) => <UncontrolledDropdown>
  <DropdownToggle tag="button" className="form-control custom-select text-left">
    <Locale value={value}/>
  </DropdownToggle>
  <DropdownMenu className="w-100">
    {locales.map(locale => <DropdownItem key={locale} active={locale === value} onClick={() => onChange(locale)}>
      <Locale value={locale}/>
    </DropdownItem>)}
  </DropdownMenu>
</UncontrolledDropdown>;
