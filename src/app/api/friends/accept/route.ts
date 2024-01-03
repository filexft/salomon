import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { ZodError, string, z } from "zod"

export async function POST(req: Request){
    try {
        const body = await req.json()

        const {id: IdToAdd} = z.object({id:string()}).parse(body)

        const session = await getServerSession(authOptions)

        if(!session){
            return new Response("Unauthorized", {status : 401})
        }

        //verify both users aren't friends
        const isAlreadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, IdToAdd)

        if(isAlreadyFriends){
            return new Response("Already Friends", {status : 400})
        }

        //verify the the user accept a request that exist 
        const hasFriendRequest = await fetchRedis('sismember', `user:${session.user.id}:incoming_friend_requests`, IdToAdd)
        
        if(!hasFriendRequest){
            return new Response("No friend Request ", {status : 400})
        }

        await db.sadd(`user:${session.user.id}:friends`, IdToAdd)
        
        await db.sadd(`user:${IdToAdd}:friends`, session.user.id)

        //removing the friend request 
        //await db.srem(`user:${IdToAdd}:outbound_friend_requests`, session.user.id) //if you add to sender part (sender sending the request ) 

        await db.srem(`user:${session.user.id}:incoming_friend_requests`, IdToAdd)


        return new Response('OK')

    } catch (error) {
        if(error instanceof ZodError){
            return new Response("Invalid request payload", {status : 422})
        }
        
        return new Response("Invalid request", {status : 400})
    }
}