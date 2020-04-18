import 'nodegit';

declare module 'nodegit' {
  export interface RemoteCallbacks {
    pushUpdateReference?: (refname: string, status: string, data: any) => void;
  }
}
