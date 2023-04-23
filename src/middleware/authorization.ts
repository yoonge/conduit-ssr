import { Context, Next } from 'koa'
import jwt from 'jsonwebtoken'

import DEFAULT from '../config/default.js'

export default async (ctx: Context, next: Next) => {
  try {
    const token = ctx.cookies.get('token')
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token as string, DEFAULT.JWT_SECRET, (err, decoded) => {
        if (err) reject(err)
        resolve(decoded)
      })
    })
    // console.log('decoded', decoded)
    const { currentUserId } = decoded as jwt.JwtPayload
    ctx.state.currentUserId = currentUserId
    await next()
  } catch (err) {
    ctx.status = 401
    await ctx.render('error', {
      msg: 'Unauthorized.',
      err: {
        status: 401,
        stack: JSON.stringify(err),
      }
    })
  }
}
