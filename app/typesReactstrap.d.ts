// TODO remove when @types module gets updated to v5
declare module 'reactstrap' {
  import * as React from 'react';

  interface CSSModule {
    [className: string]: string;
  }

  interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
    outline?: boolean;
    active?: boolean;
    block?: boolean;
    color?: string;
    disabled?: boolean;
    tag?: React.ReactType;
    innerRef?: string | ((instance: HTMLButtonElement) => any);

    onClick?: React.MouseEventHandler<any>;
    size?: any;
    id?: string;
    style?: React.CSSProperties;

    cssModule?: CSSModule;
  }

  type InputType =
    | 'text'
    | 'email'
    | 'select'
    | 'file'
    | 'radio'
    | 'checkbox'
    | 'textarea'
    | 'button'
    | 'reset'
    | 'submit'
    | 'date'
    | 'datetime-local'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'range'
    | 'search'
    | 'tel'
    | 'url'
    | 'week'
    | 'password'
    | 'datetime'
    | 'time'
    | 'color';

// Intermediate interface to "redefine" the type of size to string
// size:number => size:any => size:string
  interface Intermediate extends React.InputHTMLAttributes<HTMLInputElement> {
    size?: any;
  }

  interface InputProps extends Intermediate {
    type?: InputType;
    size?: string;
    state?: string;
    tag?: React.ReactType;
    innerRef?: string | ((instance: HTMLInputElement) => any);
    plaintext?: boolean;
    addon?: boolean;
    className?: string;
    cssModule?: CSSModule;
    // We don't have the property 'static' here because 'static' is a reserved keyword in TypeScript
    // Maybe reactstrap will support an 'isStatic' alias in the future
  }

  const Alert: React.StatelessComponent<any>;
  const Badge: React.StatelessComponent<any>;
  const Breadcrumb: React.StatelessComponent<any>;
  const BreadcrumbItem: React.StatelessComponent<any>;
  const Button: React.StatelessComponent<ButtonProps>;
  const ButtonDropdown: React.StatelessComponent<any>;
  const ButtonGroup: React.StatelessComponent<any>;
  const ButtonToolbar: React.StatelessComponent<any>;
  const Card: React.StatelessComponent<any>;
  const CardBlock: React.StatelessComponent<any>;
  const CardColumns: React.StatelessComponent<any>;
  const CardDeck: React.StatelessComponent<any>;
  const CardFooter: React.StatelessComponent<any>;
  const CardGroup: React.StatelessComponent<any>;
  const CardHeader: React.StatelessComponent<any>;
  const CardImg: React.StatelessComponent<any>;
  const CardImgOverlay: React.StatelessComponent<any>;
  const CardLink: React.StatelessComponent<any>;
  const CardSubtitle: React.StatelessComponent<any>;
  const CardText: React.StatelessComponent<any>;
  const CardTitle: React.StatelessComponent<any>;
  const Col: React.StatelessComponent<any>;
  const Collapse: React.StatelessComponent<any>;
  const Container: React.StatelessComponent<any>;
  const Dropdown: React.StatelessComponent<any>;
  const DropdownItem: React.StatelessComponent<any>;
  const DropdownMenu: React.StatelessComponent<any>;
  const DropdownToggle: React.StatelessComponent<any>;
  const Fade: React.StatelessComponent<any>;
  const Form: React.StatelessComponent<any>;
  const FormFeedback: React.StatelessComponent<any>;
  const FormGroup: React.StatelessComponent<any>;
  const FormText: React.StatelessComponent<any>;
  const Input: React.StatelessComponent<InputProps>;
  const InputGroup: React.StatelessComponent<any>;
  const InputGroupAddon: React.StatelessComponent<any>;
  const InputGroupButton: React.StatelessComponent<any>;
  const Jumbotron: React.StatelessComponent<any>;
  const Label: React.StatelessComponent<any>;
  const ListGroup: React.StatelessComponent<any>;
  const ListGroupItem: React.StatelessComponent<any>;
  const ListGroupItemHeading: React.StatelessComponent<any>;
  const ListGroupItemText: React.StatelessComponent<any>;
  const Media: React.StatelessComponent<any>;
  const Modal: React.StatelessComponent<any>;
  const ModalBody: React.StatelessComponent<any>;
  const ModalFooter: React.StatelessComponent<any>;
  const ModalHeader: React.StatelessComponent<any>;
  const Nav: React.StatelessComponent<any>;
  const Navbar: React.StatelessComponent<any>;
  const NavbarBrand: React.StatelessComponent<any>;
  const NavbarToggler: React.StatelessComponent<any>;
  const NavDropdown: React.StatelessComponent<any>;
  const NavItem: React.StatelessComponent<any>;
  const NavLink: React.StatelessComponent<any>;
  const Pagination: React.StatelessComponent<any>;
  const PaginationItem: React.StatelessComponent<any>;
  const PaginationLink: React.StatelessComponent<any>;
  const Popover: React.StatelessComponent<any>;
  const PopoverContent: React.StatelessComponent<any>;
  const PopoverTitle: React.StatelessComponent<any>;
  const Progress: React.StatelessComponent<any>;
  const Row: React.StatelessComponent<any>;
  const TabContent: React.StatelessComponent<any>;
  const Table: React.StatelessComponent<any>;
  const TabPane: React.StatelessComponent<any>;
  const Tag: React.StatelessComponent<any>;
  const TetherContent: React.StatelessComponent<any>;
  const Tooltip: React.StatelessComponent<any>;
  const UncontrolledAlert: React.StatelessComponent<any>;
  const UncontrolledButtonDropdown: React.StatelessComponent<any>;
  const UncontrolledDropdown: React.StatelessComponent<any>;
  const UncontrolledNavDropdown: React.StatelessComponent<any>;
  const UncontrolledTooltip: React.StatelessComponent<any>;
}
