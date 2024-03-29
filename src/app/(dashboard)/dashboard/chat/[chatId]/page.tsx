import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { messageArrayValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { FC } from "react";

interface PageProps {
    params: {
        chatId : string
    }
}

async function getChatMessages(chatId: string){
    try {
        const results: string[] = await fetchRedis('zrange', `chat:${chatId}:messages`, 0, -1)
        
        const dbMessage = results.map((message) => JSON.parse(message) as Message)

        const reversedDbMessage = dbMessage.reverse()

        const messages = messageArrayValidator.parse(reversedDbMessage)
        
        return messages
    } catch (error) {
        notFound()
    }
}
 
const Page = async ({params} : PageProps) => {

    const {chatId} = params
    const session = await getServerSession(authOptions)

    if(!session) notFound()

    const {user} = session

    const [userId1, userId2] = chatId.split("--")

    if(user.id !== userId1 && user.id !== userId2){
        notFound()
    }

    const chatPartnerId = user.id === userId1? userId2 : userId1;
    const chatParnter = (await fetchRedis('get', `user:${chatPartnerId}`)) as User
    const intialMessages = await getChatMessages(chatId) 

    return  <div className="flex-1  justify-between flex flex-col h-full max-h-[calc(100vh-6rem)]">
                
        </div> ;
}
 
export default Page;