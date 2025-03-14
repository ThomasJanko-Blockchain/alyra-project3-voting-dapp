'use client'
import { useState, useEffect } from 'react';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { checkIsOwner } from '@/utils/functions';
import { publicClient } from '@/utils/client';
import { contractABI, contractAddress } from '@/utils/constants';
import { parseAbiItem } from 'viem';
import WhiteList from '../WhiteList';
import ProposalRegistration from '../ProposalRegistration';
import Voting from '../Voting';
import Results from '../Results';
import WorkflowManager2 from '../WorkflowManager2';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Menus() {
    const { address, isConnected } = useAccount();
    const [isOwner, setIsOwner] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [votersEvents, setVotersEvents] = useState([]);
    const [workflowStatus, setWorkflowStatus] = useState(null);
    const [proposalsEvents, setProposalsEvents] = useState([]);
    const [numberProposals, setNumberProposals] = useState(0);

    const getVotersEvents = async () => {
        const addVoterEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock: 0n,
            toBlock: 'latest'
        });
        setVotersEvents(addVoterEvents);
    };

    const getProposalsEvents = async () => {
        const proposalRegisteredEvents = await publicClient.getLogs({
            address: contractAddress,
            event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
            fromBlock: 0n,
            toBlock: 'latest'
        });
        setProposalsEvents(proposalRegisteredEvents);
        setNumberProposals(proposalRegisteredEvents.length);
    };

    const getEvents = async () => {
        await getVotersEvents();
        await getProposalsEvents();
    };

    const menus = [
        {
            name: 'Voter Registration',
            component: <WhiteList votersEvents={votersEvents} />,
            roles: ['owner']
        },
        {
            name: 'Workflow Manager',
            component: <WorkflowManager2 workflowStatus={workflowStatus} />,
            roles: ['owner']
        },
        {
            name: 'Proposal Registration',
            component: <ProposalRegistration proposalsEvents={proposalsEvents} numberProposals={numberProposals} />,
            roles: ['voter']
        },
        {
            name: 'Voting',
            component: <Voting proposalsEvents={proposalsEvents} />,
            roles: ['voter']
        },
        {
            name: 'Results',
            component: <Results />,
            roles: ['voter']
        }
    ];

    useEffect(() => {
        console.log('addressChanged', address)
        if (address) {
            getEvents();
            setActiveMenu(null); // Reset active menu when address changes
            checkIsOwner(address)
            .then((owner) => {
                console.log('owner', owner)
                setIsOwner(owner);
            });
        }
    }, [address, isConnected]);


    useEffect(() => {
        if(!isConnected || !address ) return
        const availableMenus = menus.filter(menu => menu.roles.includes(isOwner ? 'owner' : 'voter'));
        console.log('availableMenus', availableMenus)
        if (availableMenus.length > 0 && !activeMenu) {
            setActiveMenu(availableMenus[0]);
        }
    }, [isOwner, menus, isConnected, address]);

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
    };

    return (
        <>
            {address ? (
                <div>
                    <div className='flex flex-row gap-4 justify-center'>
                        {menus.filter(menu => menu.roles.includes(isOwner ? 'owner' : 'voter')).map((menu) => (
                            <div
                                key={menu.name}
                                className={`flex gap-4 rounded-md p-2 cursor-pointer bg-blue-100 text-black hover:bg-blue-200 transition-all duration-300 ${activeMenu === menu ? 'bg-purple-200' : ''}`}
                                onClick={() => handleMenuClick(menu)}
                            >
                                <h2 className='text-lg font-bold'>{menu.name}</h2>
                            </div>
                        ))}
                    </div>
                    <div className='mt-4 transition-all duration-300'>
                        {activeMenu && menus.find(menu => menu.name === activeMenu.name).component}
                    </div>
                </div>
            ) : (
                <Alert className='bg-purple-100 w-1/2 mx-auto'>
                    <AlertCircle className='h-6 w-6' />
                    <div className='flex flex-col ml-4 text-lg justify-center'>
                        <AlertTitle>Not connected</AlertTitle>
                        <AlertDescription>Please connect your wallet to continue</AlertDescription>
                    </div>
                </Alert>
            )}
        </>
    );
}
