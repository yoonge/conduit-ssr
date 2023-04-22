import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'

import DEFAULT from '../config/default.js'

export default async (ctx: Context, next: Next) => {
  const token = ctx.cookies.get('token') || null

  if (!token) {
    ctx.status = 401
    ctx.body = {
      msg: 'Unauthorized.'
    }
    return
  }

  const decoded = await new Promise((resolve, reject) => {
    jwt.verify(token, DEFAULT.JWT_SECRET, (err, decoded) => {
      if (err) reject(err)
      resolve(decoded)
    })
  })
  if (!decoded) {
    ctx.status = 401
    ctx.body = {
      msg: 'Unauthorized.'
    }
    return
  }

  // console.log('decoded', decoded)
  const { currentUserId, username } = decoded as jwt.JwtPayload
  ctx.state.currentUserId = currentUserId
  ctx.state.username = username
  await next()
}
