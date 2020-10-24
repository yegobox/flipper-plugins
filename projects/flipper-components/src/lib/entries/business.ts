export class Business {
  id?: any;
  name?: string;
  active?: boolean;
  categoryId?: any;
  currency?: string;
  country?: string;
  businessUrl?: string;
  timeZone?: string;
  syncedOnline?: boolean;
  userId?: any;
  typeId?: any;
  createdAt?: Date;
  updatedAt?: Date;
  table?:string;
  docId?:string;
  channels:Array<string>;
  channel?:any;
  constructor(params: object = {}) {
    for (const name in params) {
      this[name] = params[name];
    }
  }
}
