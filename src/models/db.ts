import mongoose from 'mongoose'
import DEFAULT from '../config/default.js'

const dbConnection = async () => {
  await mongoose.connect(`${DEFAULT.DB_HOST}/${DEFAULT.DB_NAME}`)
}

dbConnection()
  .then(() => console.log('Database connection succeeded.'))
  .catch(err => console.error(err))

export default mongoose
