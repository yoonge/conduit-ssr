import { Context, Next } from 'koa'

import DEFAULT from '../config/default.js'
import jwt from 'jsonwebtoken'

export default async (ctx: Context, next: Next) => {
  const { authorization } = ctx.headers
  const token = authorization ? authorization.split('Bearer ')[1] : null

  if (!token) {
    ctx.status = 401
    ctx.body = {
      msg: 'Unauthorized.'
    }
    return
  }

  jwt.verify(token, DEFAULT.JWT_SECRET, (err, decoded) => {
    if (err) {
      ctx.status = 401
      ctx.body = {
        msg: 'Unauthorized.'
      }
      return
    }

    console.log('decoded', decoded)
    const { currentUserId } = decoded as jwt.JwtPayload
    ctx.currentUserId = currentUserId
    next()
  })
}
