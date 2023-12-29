import Image from 'next/image'
import { db } from '../lib/db'

export default async function Home() {
  
  await db.set('hello', 'hello');

  return (
    <div>
      Home
    </div>
  )
}
