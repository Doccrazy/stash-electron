import * as React from 'react';
import { FormProps, NameProps, PanelProps, rendererById, rendererFor } from './index';

export const EntryNameLabel = (props: Partial<NameProps>) => {
  if (!props.fileName) {
    return <span />;
  }
  const renderer = rendererFor(props.fileName);
  return <renderer.NameLabel {...(props as NameProps)} />;
};

export interface TypeIdProp {
  typeId?: string;
}

export const EntryPanel = (props: PanelProps<any> & TypeIdProp) => {
  if (!props.typeId) {
    return <div />;
  }
  const renderer = rendererById(props.typeId);
  return <renderer.Panel {...props} />;
};

export const EntryForm = (props: FormProps<any, any> & TypeIdProp) => {
  if (!props.typeId) {
    return <div />;
  }
  const renderer = rendererById(props.typeId);
  return <renderer.Form {...props} />;
};
