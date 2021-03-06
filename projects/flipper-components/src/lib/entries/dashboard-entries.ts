export class DashBoardEntries {
  id?: number
  totalStore?: Total
  grossProfit?: Total
  netProfit?: Total
  soldItems?: Items[]
  sellingBranches?: Items[]
  table?: string
  docId?: string
  chanels?: any
  chanel?: any
  constructor(params: object = {}) {
    for (const name in params) {
      this[name] = params[name]
    }
  }
}

export class Total {
  id?: number
  value?: any
  percentage?: number
  since?: string
  table?: string
  docId?: string
  channels: Array<string>
  channel: any

  constructor(params: object = {}) {
    for (const name in params) {
      this[name] = params[name]
    }
  }
}

export class Items {
  id: string
  name?: string
  updatedAt?: any
  items?: number
  total?: number
  table?: string
  docId?: string
  channels: Array<string>
  channel?: any

  constructor(params: object = {}) {
    for (const name in params) {
      this[name] = params[name]
    }
  }
}
