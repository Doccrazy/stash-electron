// @flow
import React, { Component } from 'react';
import type { Children } from 'react';
import { Navbar, NavbarBrand, Nav, NavItem, Form, Input, InputGroup, InputGroupButton, Button } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import styles from './App.css';

export default class App extends Component {
  props: {
    children: Children
  };

  render() {
    return (
      <div className={styles.root}>
        <Navbar color="dark" className={`navbar-dark navbar-expand-md ${styles.nav}`}>
          <NavbarBrand href="/"><span className={styles.logo} /> Stash</NavbarBrand>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink to="/" exact className="nav-link">Browser</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/counter" exact className="nav-link">Users</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/settings" exact className="nav-link">Settings</NavLink>
            </NavItem>
          </Nav>
          <Form inline className={`mr-3 ${styles.form}`}>
            <InputGroup className={styles.search}>
              <Input placeholder="Type to search, enter for fulltext" />
              <InputGroupButton>
                <Button>everywhere</Button>
              </InputGroupButton>
            </InputGroup>
          </Form>
          <span className="navbar-text text-warning">
            <i className={`fa fa-git-square ${styles.git}`} />&nbsp;<i className="fa fa-long-arrow-down" />2&nbsp;<i className="fa fa-long-arrow-up" />2
          </span>
        </Navbar>
        {this.props.children}
      </div>
    );
  }
}
