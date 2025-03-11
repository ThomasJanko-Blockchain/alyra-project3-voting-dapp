'use client'
import WorkflowManager2 from '../WorkflowManager2'
import WhiteList from '../WhiteList'
import ProposalRegistration from '../ProposalRegistration'
import { useAccount } from 'wagmi'
import { checkIsOwner } from '@/utils/functions'
import { useEffect, useState } from 'react'


const menus = [
    {
        name: 'Voter Registration',
        component: <WhiteList />,
        onlyOwner: true
    },
    {
        name: 'Workflow Manager',
        component: <WorkflowManager2 />,
        onlyOwner: true
    },
    {
        name: 'Proposal Registration',
        component: <ProposalRegistration />,
        onlyOwner: false
    },
    // {
    //     name: 'Voting',
    //     component: <Voting />,
    //     onlyOwner: false
    // },
    // {
    //     name: 'Results',
    //     component: <Results />,
    //     onlyOwner: false
    // }
]

export default function Menus() {

    const { address } = useAccount()
    const [isOwner, setIsOwner] = useState(false)
    const [activeMenu, setActiveMenu] = useState(null)

    useEffect(() => {
        if (!address) return
        checkIsOwner(address).then((isOwner) => {
            setIsOwner(isOwner)
        })
    }, [address])

    const menusToShow = menus.filter((menu) => {
        if (menu.onlyOwner) {
            return isOwner
        }
        return true
    })

    const handleMenuClick = (menu) => {
        setActiveMenu(menu)
    }

    useEffect(() => {
        if(activeMenu) return
        const activeMenus = menusToShow.filter((menu) => !menu.onlyOwner)
        setActiveMenu(activeMenus[0])
    }, [menusToShow])


  return (
    <div>
        <div className='flex flex-row gap-4 justify-center'>
            {menusToShow.map((menu) => (
                <div className={`flex gap-4 rounded-md p-2 cursor-pointer bg-blue-100 text-black hover:bg-blue-200 transition-all duration-300 ${activeMenu === menu ? 'bg-purple-200' : ''}`}
                 key={menu.name} 
                 onClick={() => handleMenuClick(menu)}
                 >
                    <h2>{menu.name}</h2>
                </div>
            ))}
        </div>
        <div className='mt-4 transition-all duration-300'>
            {activeMenu && activeMenu.component}
        </div>
    </div>
  )
}
