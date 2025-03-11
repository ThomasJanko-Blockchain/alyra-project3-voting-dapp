'use client'
import { checkIsOwner } from '@/utils/functions'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

export default function Account() {
  const { address, isConnected } = useAccount()
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (!address) return
    checkIsOwner(address).then((isOwner) => {
        setIsOwner(isOwner)
    })
}, [address, isConnected])

  
  return (
    <div>
        {isConnected && (
            <div>
                Logged in as {
                    isOwner ? 'Owner' : 'Guest'
                }
            </div>
        )}
    </div>
  )
}
