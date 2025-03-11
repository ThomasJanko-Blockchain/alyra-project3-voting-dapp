import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import Account from '../shared/Account'

export default function NavBar() {
  return (
    <div className='flex justify-between items-center p-8'>
        <div className='flex items-center gap-4'>
            <Image src='/favicon.ico' alt='logo' width={32} height={32} />
            <h1 className='text-2xl font-bold'>Voting Dapp</h1>
        </div>
        <div className='flex flex-col items-center gap-4'>
            <ConnectButton showBalance={false} />
            <Account />
        </div>
    </div>
  )
}
