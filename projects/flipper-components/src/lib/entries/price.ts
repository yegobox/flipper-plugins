export class Price {
  id?: any;
  name: string;
  branchId?: any;
  groupId?: any;
  validFrom?: any;
  validTo?: any;
  isDefault?: boolean;
  syncedOnline?: boolean;
  createdAt?: any;
  updatedAt?: any;
  table?:string;
  docId?:string;
  channels:Array<any>;
  channel?:any;

  constructor(params: object = {}) {
    for (const name in params) {
      this[name] = params[name];
    }
  }
}
