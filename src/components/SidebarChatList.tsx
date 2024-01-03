"use client"

import { chatHrefConstructor } from "@/lib/utiles";
import { usePathname, useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";

interface SidebarChatListProps {
    friends: User[],
    sessionId : string
}
 
const SidebarChatList: FC<SidebarChatListProps> = ({friends, sessionId}) => {
    const router = useRouter()
    const pathname = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])

    useEffect(() => {
        if(pathname?.includes('chat')){
            setUnseenMessages((prev) => {
                return prev.filter((msg) => !pathname.includes(msg.senderId))
            })
        }
    }, [pathname])


    return <ul role="list" className="max-h-[25rem] overflow-y-auto  -mt-2 space-y-1">
        {
            friends.sort().map((friend) => {
                //unseen message count per friend  
                const unseenMessagesCount = unseenMessages.filter((unseenmsg) => {
                    return unseenmsg.senderId === friend.id
                }).length
                //we use a tag instead Link cuz we want the hard refresh effect to get the latest msg count 
                return <li key={friend.id}>
                    <a 
                        className="text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 leading-6 font-semibold"
                    href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`}>
                        {friend.name}
                        {
                            unseenMessagesCount > 0 ? (
                                <div className="bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center">
                                    {unseenMessagesCount}
                                </div>
                            ): null
                        }
                    </a>
                </li>
            })
        }
    </ul>;
}
 
export default SidebarChatList;