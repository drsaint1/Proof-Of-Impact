import { useState, useEffect } from 'react';
import { parseEther, formatEther, Interface } from 'ethers';
import { Vote, Plus, CheckCircle, XCircle, MinusCircle, Clock, Users, Ban, MessageSquare, Send } from 'lucide-react';
import { getContracts } from '../utils/contracts';
import { useToast } from '../hooks/useToast';
import { uploadTextToIPFS, getFromIPFS } from '../utils/ipfs';
import GovernanceABI from '../contracts/Governance.json';

interface GovernanceDashboardProps {
  connex: any;
  account: string;
}

interface Proposal {
  id: number;
  proposer: string;
  ipfsHash: string;
  startTime: number;
  endTime: number;
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  executed: boolean;
  cancelled: boolean;
  state: number;
  title?: string;
  description?: string;
  commentCount?: number;
}

interface Comment {
  commenter: string;
  ipfsHash: string;
  timestamp: number;
  text?: string;
}

enum VoteOption {
  Against = 0,
  For = 1,
  Abstain = 2,
}

enum ProposalState {
  Active = 0,
  Defeated = 1,
  Passed = 2,
  Executed = 3,
  Cancelled = 4,
}

export default function GovernanceDashboard({ connex, account }: GovernanceDashboardProps) {
  const toast = useToast();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<bigint>(0n);
  const [votingOnProposal, setVotingOnProposal] = useState<number | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<number | null>(null);
  const [viewingProposal, setViewingProposal] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [key: number]: Comment[] }>({});
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  const MIN_BALANCE = parseEther('100');

  useEffect(() => {
    if (!connex) return;
    loadProposals();
    loadUserBalance();
  }, [connex, account]);

  const loadUserBalance = async () => {
    try {
      const { stakingPool } = await getContracts(connex, account);
      const stakeInfo = await stakingPool.getStakeInfo(account);
      const stakedAmount = stakeInfo[0]; // First element is the staked amount
      setUserBalance(stakedAmount);
    } catch (error) {
    }
  };

  const loadProposals = async () => {
    try {
      const { governanceContract } = await getContracts(connex, account);

      // Get proposal count
      const count = await governanceContract.proposalCount();

      if (count === 0n) {
        setProposals([]);
        return;
      }

      // Load all proposals
      const proposalPromises = [];
      for (let i = 1; i <= Number(count); i++) {
        proposalPromises.push(loadProposal(governanceContract, i));
      }

      const allProposals = await Promise.all(proposalPromises);
      setProposals(allProposals.reverse()); // Newest first
    } catch (error) {
      console.error('Error loading proposals:', error);
      setProposals([]);
    }
  };

  const loadProposal = async (contract: any, id: number) => {
    const proposal = await contract.getProposal(id);
    const state = await contract.getProposalState(id);
    const commentCount = await contract.getCommentCount(id);

    // Parse IPFS hash to get title and description
    const ipfsHash = proposal[1];

    let title = `Proposal #${id}`;
    let description = 'Loading...';

    try {
      // Decode bytes32 to string (browser-compatible)
      const hashBytes = ipfsHash.slice(2); // Remove 0x
      let jsonStr = '';
      for (let i = 0; i < hashBytes.length; i += 2) {
        const byte = parseInt(hashBytes.substr(i, 2), 16);
        if (byte !== 0) jsonStr += String.fromCharCode(byte);
      }

      const proposalData = JSON.parse(jsonStr);
      title = proposalData.title || title;
      description = proposalData.description || description;
    } catch (err) {
      try {
        const hashBytes = ipfsHash.slice(2);
        let jsonStr = '';
        for (let i = 0; i < hashBytes.length; i += 2) {
          const byte = parseInt(hashBytes.substr(i, 2), 16);
          if (byte !== 0) jsonStr += String.fromCharCode(byte);
        }
        const titleMatch = jsonStr.match(/"title":"([^"]+)"/);
        if (titleMatch) title = titleMatch[1];
      } catch (e) {
      }
      description = `Data: ${ipfsHash.slice(0, 10)}...`;
    }

    const stateNum = typeof state === 'bigint' ? Number(state) : Number(state);

    return {
      id,
      proposer: proposal[0],
      ipfsHash,
      startTime: Number(proposal[2]),
      endTime: Number(proposal[3]),
      forVotes: proposal[4],
      againstVotes: proposal[5],
      abstainVotes: proposal[6],
      executed: proposal[7],
      cancelled: proposal[8],
      state: stateNum,
      commentCount: Number(commentCount),
      title,
      description,
    };
  };

  const handleCreateProposal = async () => {
    if (!formData.title || !formData.description) {
      toast.warning('Please fill in all fields');
      return;
    }

    if (userBalance < MIN_BALANCE) {
      toast.error('You need at least 100 B3TR to create a proposal');
      return;
    }

    setLoading(true);
    try {
      // Create IPFS hash from title + description (simplified)
      // In production, upload to IPFS and use real hash
      const data = JSON.stringify({ title: formData.title, description: formData.description });
      const ipfsHash = '0x' + Array.from(data).map((_, i) =>
        i < 32 ? data.charCodeAt(i).toString(16).padStart(2, '0') : ''
      ).join('').padEnd(64, '0');

      // Encode function data manually
      const governanceInterface = new Interface(GovernanceABI.abi);
      const createData = governanceInterface.encodeFunctionData('createProposal', [ipfsHash]);

      const createClause = {
        to: import.meta.env.VITE_GOVERNANCE_ADDRESS,
        value: '0x0',
        data: createData
      };

      const tx = connex.vendor.sign('tx', [createClause])
        .signer(account)
        .gas(1600000)
        .comment('Create Governance Proposal');

      const result = await tx.request();

      setFormData({ title: '', description: '' });
      setShowCreateForm(false);

      // Reload proposals
      setTimeout(loadProposals, 2000);
      toast.success('Proposal created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create proposal');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, option: VoteOption) => {
    if (userBalance < MIN_BALANCE) {
      toast.error('You need at least 100 B3TR to vote');
      return;
    }

    setVotingOnProposal(proposalId);
    try {
      // Encode function data manually
      const governanceInterface = new Interface(GovernanceABI.abi);
      const voteData = governanceInterface.encodeFunctionData('castVote', [proposalId, option]);

      const voteClause = {
        to: import.meta.env.VITE_GOVERNANCE_ADDRESS,
        value: '0x0',
        data: voteData
      };

      const tx = connex.vendor.sign('tx', [voteClause])
        .signer(account)
        .gas(400000)
        .comment(`Vote on Proposal #${proposalId}`);

      const result = await tx.request();

      setTimeout(loadProposals, 2000);
      setTimeout(loadProposals, 2000);
      toast.success('Vote cast successfully!');
    } catch (error: any) {
      console.error('Error voting:', error);
      toast.error(error.message || 'Failed to cast vote');
    } finally {
      setVotingOnProposal(null);
    }
  };

  const handleExecute = async (proposalId: number) => {
    try {
      // Encode function data manually
      const governanceInterface = new Interface(GovernanceABI.abi);
      const executeData = governanceInterface.encodeFunctionData('executeProposal', [proposalId]);

      const executeClause = {
        to: import.meta.env.VITE_GOVERNANCE_ADDRESS,
        value: '0x0',
        data: executeData
      };

      const tx = connex.vendor.sign('tx', [executeClause])
        .signer(account)
        .gas(500000)
        .comment(`Execute Proposal #${proposalId}`);

      const result = await tx.request();

      setTimeout(loadProposals, 2000);
      toast.success('Proposal executed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to execute proposal');
    }
  };

  const handleCancel = async (proposalId: number) => {
    try {
      // Encode function data manually
      const governanceInterface = new Interface(GovernanceABI.abi);
      const cancelData = governanceInterface.encodeFunctionData('cancelProposal', [proposalId]);

      const cancelClause = {
        to: import.meta.env.VITE_GOVERNANCE_ADDRESS,
        value: '0x0',
        data: cancelData
      };

      const tx = connex.vendor.sign('tx', [cancelClause])
        .signer(account)
        .gas(400000)
        .comment(`Cancel Proposal #${proposalId}`);

      const result = await tx.request();

      setTimeout(loadProposals, 2000);
      toast.success('Proposal cancelled successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel proposal');
    }
  };

  const loadComments = async (proposalId: number) => {
    try {
      const { governanceContract } = await getContracts(connex, account);
      const result = await governanceContract.getAllComments(proposalId);

      const commenters = result[0] || [];
      const ipfsHashes = result[1] || [];
      const timestamps = result[2] || [];

      // Load comment text from IPFS for each comment
      const loadedComments: Comment[] = await Promise.all(
        commenters.map(async (commenter: string, index: number) => {
          let text = 'Loading...';
          try {
            // Convert bytes32 back to IPFS hash (browser-compatible)
            const hashBytes = ipfsHashes[index].slice(2); // Remove 0x
            // Convert hex to string
            let ipfsHashStr = '';
            for (let i = 0; i < hashBytes.length; i += 2) {
              const byte = parseInt(hashBytes.substr(i, 2), 16);
              if (byte !== 0) ipfsHashStr += String.fromCharCode(byte);
            }

            // Fetch comment text from IPFS
            text = await getFromIPFS(ipfsHashStr);
          } catch (err) {
            text = '[Comment unavailable]';
          }

          return {
            commenter,
            ipfsHash: ipfsHashes[index],
            timestamp: Number(timestamps[index]),
            text,
          };
        })
      );

      setComments(prev => ({ ...prev, [proposalId]: loadedComments }));
    } catch (error) {
    }
  };

  const handleAddComment = async (proposalId: number) => {
    if (!commentText.trim()) {
      toast.warning('Please enter a comment');
      return;
    }

    if (userBalance < MIN_BALANCE) {
      toast.error('You need at least 100 B3TR staked to comment');
      return;
    }

    setAddingComment(true);
    try {
      // Upload comment text to IPFS
      toast.info('Uploading comment to IPFS...');
      const ipfsHashStr = await uploadTextToIPFS(commentText);

      // Convert IPFS hash (Qm...) to bytes32 for contract (browser-compatible)
      let hexStr = '';
      for (let i = 0; i < ipfsHashStr.length; i++) {
        hexStr += ipfsHashStr.charCodeAt(i).toString(16).padStart(2, '0');
      }
      const ipfsHash = '0x' + hexStr.padEnd(64, '0').slice(0, 64);

      // Encode function data manually
      const governanceInterface = new Interface(GovernanceABI.abi);
      const addCommentData = governanceInterface.encodeFunctionData('addComment', [proposalId, ipfsHash]);

      const addCommentClause = {
        to: import.meta.env.VITE_GOVERNANCE_ADDRESS,
        value: '0x0',
        data: addCommentData
      };

      const tx = connex.vendor.sign('tx', [addCommentClause])
        .signer(account)
        .gas(400000)
        .comment(`Comment on Proposal #${proposalId}`);

      const result = await tx.request();

      setCommentText('');
      toast.success('Comment added successfully!');

      setTimeout(() => {
        loadComments(proposalId);
        loadProposals();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const toggleComments = async (proposalId: number) => {
    if (selectedProposal === proposalId) {
      setSelectedProposal(null);
    } else {
      setSelectedProposal(proposalId);
      if (!comments[proposalId]) {
        await loadComments(proposalId);
      }
    }
  };

  const getStateInfo = (state: number) => {
    switch (state) {
      case ProposalState.Active:
        return { label: 'Active', color: 'blue', icon: Clock };
      case ProposalState.Passed:
        return { label: 'Passed', color: 'green', icon: CheckCircle };
      case ProposalState.Defeated:
        return { label: 'Defeated', color: 'red', icon: XCircle };
      case ProposalState.Executed:
        return { label: 'Executed', color: 'purple', icon: CheckCircle };
      case ProposalState.Cancelled:
        return { label: 'Cancelled', color: 'gray', icon: Ban };
      default:
        return { label: 'Unknown', color: 'gray', icon: MinusCircle };
    }
  };

  const getTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) return 'Ended';

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Governance</h1>
          <p className="text-gray-600">Create and vote on proposals to shape the platform</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={userBalance < MIN_BALANCE}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus size={20} />
          Create Proposal
        </button>
      </div>

      {/* Balance Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <Vote size={20} className="text-green-600" />
          <span className="font-medium">Your B3TR Balance:</span>
          <span className="text-green-600 font-bold">{formatEther(userBalance)}</span>
          {userBalance < MIN_BALANCE && (
            <span className="text-red-600 ml-2">(Need 100 B3TR to participate)</span>
          )}
        </div>
      </div>

      {/* Create Proposal Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Create New Proposal</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Enter proposal title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 h-32"
                placeholder="Describe your proposal in detail"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleCreateProposal}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Creating...' : 'Submit Proposal'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        {proposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Proposals Yet</h3>
            <p className="text-gray-500">Be the first to create a governance proposal!</p>
          </div>
        ) : (
          proposals.map((proposal) => {
            const stateInfo = getStateInfo(proposal.state);
            const StateIcon = stateInfo.icon;
            const totalVotes = BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes);
            const forPercentage = totalVotes > 0n ? Number((BigInt(proposal.forVotes) * 100n) / totalVotes) : 0;
            const againstPercentage = totalVotes > 0n ? Number((BigInt(proposal.againstVotes) * 100n) / totalVotes) : 0;

            return (
              <div key={proposal.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3
                        className="text-xl font-bold text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                        onClick={() => setViewingProposal(proposal.id)}
                      >
                        {proposal.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${stateInfo.color}-100 text-${stateInfo.color}-700 flex items-center gap-1`}>
                        <StateIcon size={16} />
                        {stateInfo.label}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-2">{proposal.description}</p>
                    <p className="text-sm text-gray-500">
                      Proposed by {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">{getTimeRemaining(proposal.endTime)}</p>
                  </div>
                </div>

                {/* Vote Bars */}
                <div className="space-y-2 mb-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600">For</span>
                      <span className="font-medium">{formatEther(proposal.forVotes)} ({forPercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${forPercentage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600">Against</span>
                      <span className="font-medium">{formatEther(proposal.againstVotes)} ({againstPercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${againstPercentage}%` }} />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {proposal.state === ProposalState.Active && (
                    <>
                      <button
                        onClick={() => handleVote(proposal.id, VoteOption.For)}
                        disabled={votingOnProposal === proposal.id || userBalance < MIN_BALANCE}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Vote For
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, VoteOption.Against)}
                        disabled={votingOnProposal === proposal.id || userBalance < MIN_BALANCE}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        Vote Against
                      </button>
                      <button
                        onClick={() => handleVote(proposal.id, VoteOption.Abstain)}
                        disabled={votingOnProposal === proposal.id || userBalance < MIN_BALANCE}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 flex items-center gap-2"
                      >
                        <MinusCircle size={16} />
                        Abstain
                      </button>
                      {proposal.proposer.toLowerCase() === account.toLowerCase() && (
                        <button
                          onClick={() => handleCancel(proposal.id)}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 ml-auto"
                        >
                          <Ban size={16} />
                          Cancel
                        </button>
                      )}
                    </>
                  )}

                  {proposal.state === ProposalState.Passed && !proposal.executed && (
                    <button
                      onClick={() => handleExecute(proposal.id)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Execute
                    </button>
                  )}

                  <button
                    onClick={() => toggleComments(proposal.id)}
                    className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2 ml-auto"
                  >
                    <MessageSquare size={16} />
                    Comments ({proposal.commentCount || 0})
                  </button>
                </div>

                {/* Comments Section */}
                {selectedProposal === proposal.id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <MessageSquare size={20} />
                      Discussion
                    </h4>

                    {/* Add Comment */}
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Share your thoughts..."
                          className="flex-1 border rounded-lg px-4 py-2"
                          disabled={addingComment}
                        />
                        <button
                          onClick={() => handleAddComment(proposal.id)}
                          disabled={addingComment || !commentText.trim() || userBalance < MIN_BALANCE}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
                        >
                          <Send size={16} />
                          {addingComment ? 'Posting...' : 'Post'}
                        </button>
                      </div>
                      {userBalance < MIN_BALANCE && (
                        <p className="text-sm text-red-600 mt-1">Need 100+ B3TR staked to comment</p>
                      )}
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3">
                      {(!comments[proposal.id] || comments[proposal.id].length === 0) ? (
                        <p className="text-gray-500 text-center py-8">No comments yet. Be the first to share your thoughts!</p>
                      ) : (
                        comments[proposal.id].map((comment, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-sm">
                                {comment.commenter.slice(0, 6)}...{comment.commenter.slice(-4)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(comment.timestamp * 1000).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{comment.text}</p>
                            <p className="text-xs text-gray-400 mt-1">IPFS: {comment.ipfsHash.slice(0, 10)}...</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Proposal Detail Modal */}
      {viewingProposal && proposals.find(p => p.id === viewingProposal) && (() => {
        const proposal = proposals.find(p => p.id === viewingProposal)!;
        const stateInfo = getStateInfo(proposal.state);
        const StateIcon = stateInfo.icon;

        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setViewingProposal(null)}>
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{proposal.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${stateInfo.color}-100 text-${stateInfo.color}-700 inline-flex items-center gap-1`}>
                      <StateIcon size={16} />
                      {stateInfo.label}
                    </span>
                  </div>
                  <button
                    onClick={() => setViewingProposal(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{proposal.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Proposed by</p>
                      <p className="font-medium">{proposal.proposer.slice(0, 10)}...{proposal.proposer.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time Remaining</p>
                      <p className="font-medium">{getTimeRemaining(proposal.endTime)}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Voting Results</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-green-600 font-medium">For</span>
                          <span>{formatEther(proposal.forVotes)} B3TR</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-green-500 h-3 rounded-full" style={{
                            width: `${(BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes)) > 0n
                              ? Number((BigInt(proposal.forVotes) * 100n) / (BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes)))
                              : 0}%`
                          }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-red-600 font-medium">Against</span>
                          <span>{formatEther(proposal.againstVotes)} B3TR</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-red-500 h-3 rounded-full" style={{
                            width: `${(BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes)) > 0n
                              ? Number((BigInt(proposal.againstVotes) * 100n) / (BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes)))
                              : 0}%`
                          }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 font-medium">Abstain</span>
                          <span>{formatEther(proposal.abstainVotes)} B3TR</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div className="bg-gray-400 h-3 rounded-full" style={{
                            width: `${(BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes)) > 0n
                              ? Number((BigInt(proposal.abstainVotes) * 100n) / (BigInt(proposal.forVotes) + BigInt(proposal.againstVotes) + BigInt(proposal.abstainVotes)))
                              : 0}%`
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    {proposal.state === ProposalState.Active && (
                      <>
                        <button
                          onClick={() => {
                            setViewingProposal(null);
                            handleVote(proposal.id, VoteOption.For);
                          }}
                          disabled={votingOnProposal === proposal.id || userBalance < MIN_BALANCE}
                          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                          <CheckCircle size={16} />
                          Vote For
                        </button>
                        <button
                          onClick={() => {
                            setViewingProposal(null);
                            handleVote(proposal.id, VoteOption.Against);
                          }}
                          disabled={votingOnProposal === proposal.id || userBalance < MIN_BALANCE}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                        >
                          <XCircle size={16} />
                          Vote Against
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
