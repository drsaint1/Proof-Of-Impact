import { useWallet, useConnectModal, useAccountModal } from '@vechain/vechain-kit'
import { Wallet, LogOut } from 'lucide-react'

export default function WalletButton() {
  const { account, connection, disconnect } = useWallet()
  const { open: openConnectModal } = useConnectModal()
  const { open: openAccountModal } = useAccountModal()

  const handleConnect = () => {
    openConnectModal()
  }

  const handleDisconnect = () => {
    disconnect()
  }

  if (!connection?.isConnected || !account) {
    return (
      <button
        onClick={handleConnect}
        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <Wallet className="h-5 w-5" />
        <span>Connect Wallet</span>
      </button>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div
        className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={openAccountModal}
        title="View Account Details"
      >
        <Wallet className="h-5 w-5 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </span>
      </div>
      <button
        onClick={handleDisconnect}
        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
        title="Disconnect"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  )
}
