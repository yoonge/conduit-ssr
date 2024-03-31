import jwt from 'jsonwebtoken'
import DEFAULT from '../config/default.js'

export const generateToken = async (_id: string, username: string, expiresIn: number = 3600) => {
  return new Promise((resolve, reject) => {
    jwt.sign({ cuid: _id, username }, DEFAULT.JWT_SECRET, { expiresIn }, (err, token) => {
      if (err) reject(err)
      resolve(token)
    })
  })
}
