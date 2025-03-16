// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Système de vote
 * @author Alyra
 * @notice Ce contrat permet de gérer un système de vote complet
 * @dev Implémente un workflow de vote et hérite du contrat Ownable d'OpenZeppelin
 */
contract Voting is Ownable {

    uint public winningProposalID;
    
    /**
     * @notice Structure représentant un électeur
     * @dev Stocke les informations sur l'enregistrement et le vote de chaque électeur
     */
    struct Voter {
        bool isRegistered;      // Indique si l'adresse est enregistrée comme électeur
        bool hasVoted;          // Indique si l'électeur a déjà voté
        uint votedProposalId;   // ID de la proposition pour laquelle l'électeur a voté
    }

    /**
     * @notice Structure représentant une proposition
     * @dev Contient la description de la proposition et le nombre de votes reçus
     */
    struct Proposal {
        string description;     // Description de la proposition
        uint voteCount;         // Nombre de votes pour cette proposition
    }

    /**
     * @notice Les différents états du processus de vote
     * @dev Utilisé pour contrôler le flux de travail et les actions autorisées
     */
    enum WorkflowStatus {
        RegisteringVoters,           // Enregistrement des électeurs
        ProposalsRegistrationStarted, // Enregistrement des propositions démarré
        ProposalsRegistrationEnded,   // Enregistrement des propositions terminé
        VotingSessionStarted,         // Session de vote démarrée
        VotingSessionEnded,           // Session de vote terminée
        VotesTallied                  // Votes comptabilisés
    }

    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping (address => Voter) voters;

    /**
     * @notice Événements émis lors des différentes actions du contrat
     */
    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    /**
     * @notice Initialise le contrat avec l'adresse du déployeur comme propriétaire
     */
    constructor() Ownable(msg.sender) {}
    
    /**
     * @notice Vérifie que l'appelant est un électeur enregistré
     * @dev Utilisé comme modificateur pour restreindre l'accès aux fonctions réservées aux électeurs
     */
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    
    // ::::::::::::: GETTERS ::::::::::::: //

    /**
     * @notice Récupère les informations d'un électeur
     * @param _addr L'adresse de l'électeur à consulter
     * @return _ Les informations complètes de l'électeur
     */
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    /**
     * @notice Récupère les informations d'une proposition
     * @param _id L'identifiant de la proposition
     * @return _ La proposition complète (description et nombre de votes)
     */
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }

    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /**
     * @notice Ajoute un nouvel électeur au système
     * @param _addr L'adresse de l'électeur à enregistrer
     * @dev Ne peut être appelée que par le propriétaire et uniquement pendant la phase d'enregistrement
     */
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 
    // ::::::::::::: PROPOSAL ::::::::::::: // 

    /**
     * @notice Permet à un électeur d'ajouter une proposition
     * @param _desc La description de la proposition
     * @dev Ne peut être appelée que par un électeur enregistré pendant la phase d'enregistrement des propositions
     */
    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer');

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length-1);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /**
     * @notice Permet à un électeur de voter pour une proposition
     * @param _id L'identifiant de la proposition choisie
     * @dev Ne peut être appelée que par un électeur enregistré pendant la phase de vote
     */
    function setVote(uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found');

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(msg.sender, _id);
    }

    // ::::::::::::: STATE ::::::::::::: //

    /**
     * @notice Démarre la phase d'enregistrement des propositions
     * @dev Ne peut être appelée que par le propriétaire et crée une proposition GENESIS par défaut
     */
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);
        
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /**
     * @notice Termine la phase d'enregistrement des propositions
     * @dev Ne peut être appelée que par le propriétaire
     */
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /**
     * @notice Démarre la session de vote
     * @dev Ne peut être appelée que par le propriétaire après la fin de l'enregistrement des propositions
     */
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /**
     * @notice Termine la session de vote
     * @dev Ne peut être appelée que par le propriétaire
     */
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /**
     * @notice Comptabilise les votes et détermine la proposition gagnante
     * @dev Ne peut être appelée que par le propriétaire après la fin de la session de vote
     */
    function tallyVotes() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
        uint _winningProposalId;
        for (uint256 p = 0; p < proposalsArray.length; p++) {
            if (proposalsArray[p].voteCount > proposalsArray[_winningProposalId].voteCount) {
                _winningProposalId = p;
            }
        }
        winningProposalID = _winningProposalId;
        
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}