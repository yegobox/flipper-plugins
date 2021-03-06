export class User {
  id: any
  name: string
  email: string
  token?: string
  active?: boolean
  createdAt: string
  updatedAt: string
  // FIXME(ganza): each model or document should have channels[userId] to authenticate the data
  table: string
  docId?: string
  channels: Array<string>
  expiresAt: any
  userId: any
  channel?: string

  constructor(params: object = {}) {
    for (const name in params) {
      this[name] = params[name]
    }
  }
}
