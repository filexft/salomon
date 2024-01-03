import { FC} from 'react'
import Button from '../../../components/ui/Button';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface pageProps {
    
}
 

const Page: FC<pageProps> = async ({}) => {

    const session = await getServerSession(authOptions)

    return <>
    
    <pre>Dashboard</pre>
    
    </> 
}
 

export default Page;