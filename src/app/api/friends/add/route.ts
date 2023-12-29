import { fetchRedis } from "@/helpers/redis"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { addFriendValidator } from "@/lib/validations/add-friend"
import { getServerSession } from "next-auth"
import { ZodError } from "zod"


export async function POST(req : Request){
    try {
        const body = await req.json()

        const {email: emailToAdd} = addFriendValidator.parse(body.email)

        const RESTResponse = await fetch(
            `${process.env.UPSTASH_REDIS_REST_URL}/get/user:email:${emailToAdd}`,
            {
                headers : {
                    Authorization : `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
                },
                cache : 'no-store'
            }
            )
        
        const data = (await RESTResponse.json()) as {result : string | null}
        const IdToAdd = data.result

        if(!IdToAdd){
            return new Response("This person doesn't exist", {status:400})
        }

        const session = await getServerSession(authOptions)

        if(!session){
            return new Response('UnAuthorised', {status : 401})
        }

        if(IdToAdd === session.user.id){
            return new Response("You can not add your self stupid!", {status : 400})
        }

        //check if user is already added
        const isAleadyAdd = await fetchRedis('sismember', `user:${IdToAdd}:incoming_friend_requests`, session.user.id) as 0 | 1
        
        if(isAleadyAdd){
            return new Response("you have already sent  friend request ", {status: 400})
        }
        //valid request 

        //check if user is already Friend
        const isAleadyFriends = await fetchRedis('sismember', `user:${session.user.id}:friends`, IdToAdd) as 0 | 1
        
        if(isAleadyFriends){
            return new Response("you are already  a friends with this user ", {status: 400})
        }

        //valid request, send friend request  
        db.sadd(`user:${IdToAdd}:incoming_friend_requests`, session.user.id)

        return new Response('OK')
        console.log(data)
    } catch (error) {
        if (error instanceof ZodError){
            return new Response("Invalid request payload", {status : 422})
        }

        return new Response("Invalid request", {status : 400})
        
    }
}