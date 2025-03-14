'use client'
import WorkflowManager2 from '../WorkflowManager2'
import WhiteList from '../WhiteList'
import ProposalRegistration from '../ProposalRegistration'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { checkIsOwner } from '@/utils/functions'
import { useEffect, useState } from 'react'
import Voting from '../Voting'
import Results from '../Results'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertCircle } from 'lucide-react'
import { publicClient } from '@/utils/client'
import { contractABI, contractAddress } from '@/utils/constants'
import { parseAbiItem } from 'viem'



export default function Menus() {
    
    const { address } = useAccount()
    const [isOwner, setIsOwner] = useState(false)
    const [activeMenu, setActiveMenu] = useState(null)
    const [votersEvents, setVotersEvents] = useState([])
    const [workflowStatus, setWorkflowStatus] = useState(null)
    const [proposalsEvents, setProposalsEvents] = useState([])

    const getVotersEvents = async () => {
        const addVoterEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock: 0n,
            toBlock: 'latest'
        })
        console.log(addVoterEvents)
        setVotersEvents(addVoterEvents)
    }
    const getProposalsEvents = async () => {
        const proposalRegisteredEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
            fromBlock: 0n,
            toBlock: 'latest'
        })
        console.log(proposalRegisteredEvents)
        setProposalsEvents(proposalRegisteredEvents)
    }
    const getEvents = async () => {
        await getVotersEvents()
        await getProposalsEvents()
    }

    const menus = [
        {
            name: 'Voter Registration',
            component: <WhiteList votersEvents={votersEvents} />,
            show: ['owner']
        },
        {
            name: 'Workflow Manager',
            component: <WorkflowManager2 workflowStatus={workflowStatus} />,
            show: ['owner']
        },
        {
            name: 'Proposal Registration',
            component: <ProposalRegistration proposalsEvents={proposalsEvents} />,
            show: ['voter']
        },
        {
            name: 'Voting',
            component: <Voting proposalsEvents={proposalsEvents} />,
            show: ['voter']
        },
        {
            name: 'Results',
            component: <Results />,
            show: ['voter']
        }
    ]


    useEffect(() => {
        const getAllEvents = async() => {
          if(address !== 'undefined') {
            await getEvents();
          }
        }
        getAllEvents();
      }, [address])
    

    useEffect(() => {
        if (!address) return
        checkIsOwner(address).then((isOwner) => {
            setIsOwner(isOwner)
        })
    }, [address])

    const menusToShow = menus.filter((menu) => {
        if (menu.show.includes('owner')) {
            return isOwner
        }
        return true
    })

    const handleMenuClick = (menu) => {
        setActiveMenu(menu)
    }

    useEffect(() => {
        if(activeMenu) return
        const activeMenus = menusToShow.filter((menu) => !menu.show.includes('owner'))
        if (activeMenus.length === 0) return
        setActiveMenu(activeMenus[0])
    }, [menusToShow])

    // useWatchContractEvent({
    //     address: contractAddress,
    //     abi: contractABI,
    //     eventName: 'ProposalRegistered',
    //     onLogs(log) {
    //         console.log('ProposalRegistered event triggered', log[0].args.proposalId.toString())
    //         setNumberProposals(log[0].args.proposalId.toString())
    //     },
    // })

  return (
    <>
        {address ? (
            <div>
                <div className='flex flex-row gap-4 justify-center'>
                    {menusToShow.map((menu) => (
                <div className={`flex gap-4 rounded-md p-2 cursor-pointer bg-blue-100 text-black hover:bg-blue-200 transition-all duration-300 ${activeMenu === menu ? 'bg-purple-200' : ''}`}
                 key={menu.name} 
                 onClick={() => handleMenuClick(menu)}
                 >
                    <h2 className='text-lg font-bold'>{menu.name}</h2>
                </div>
            ))}
        </div>
        <div className='mt-4 transition-all duration-300'>
                {activeMenu && activeMenu.component}
            </div>
        </div>
        ): (
        <Alert className='bg-purple-100 w-1/2 mx-auto'>
            <AlertCircle className='h-6 w-6' />
            <div className='flex flex-col ml-4 text-lg justify-center'>
                <AlertTitle className=''>Not connected</AlertTitle>
                <AlertDescription>Please connect your wallet to continue</AlertDescription>
            </div>
        </Alert>
        )}
    </>
  )
}
