export class Menu {
  id?: any;
  name?: string;
  icon?: string;
  route?: string;
  active?: boolean;
  isSetting?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  channels:Array<any>;
  channel?:any;
  constructor(params: object = {}) {
    for (const name in params) {
      this[name] = params[name];
    }
  }
}
