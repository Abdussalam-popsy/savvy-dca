"""
SpoonOS Tools for Neo X Testnet (EVM)
Tools for interacting with Neo blockchain via Web3
"""
import os
import logging
import time
import json
from typing import Dict, Any, Optional
from decimal import Decimal

from web3 import Web3
from web3.middleware import geth_poa_middleware
from eth_account import Account
from spoon_ai.tools.base import BaseTool

logger = logging.getLogger(__name__)

# Standard Uniswap V2 Router ABI (minimal version for swaps)
UNISWAP_V2_ROUTER_ABI = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactETHForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForETH",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
            {"internalType": "uint256", "name": "amountOutMin", "type": "uint256"},
            {"internalType": "address[]", "name": "path", "type": "address[]"},
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForTokens",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "token", "type": "address"},
            {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "getAmountsOut",
        "outputs": [{"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# Standard ERC20 ABI for approve and allowance
ERC20_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": True,
        "inputs": [
            {"name": "_owner", "type": "address"},
            {"name": "_spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
]


class NeoBalanceTool(BaseTool):
    """
    Tool to get native GAS/NEO balance for a wallet address on Neo X Testnet
    """
    
    def __init__(self, **kwargs):
        super().__init__(
            name="neo_balance",
            description="Get the native GAS/NEO balance for a wallet address on Neo X Testnet (EVM)",
            parameters={
                "type": "object",
                "properties": {
                    "wallet_address": {
                        "type": "string",
                        "description": "The wallet address to check balance for (Ethereum format, 0x...)"
                    }
                },
                "required": ["wallet_address"]
            },
            **kwargs
        )
        self._web3 = None
    
    @property
    def web3(self) -> Web3:
        """Lazy initialization of Web3 connection to Neo X Testnet"""
        if self._web3 is None:
            rpc_url = os.getenv('NEO_RPC_URL', 'https://testnet.neox.network:443')
            if not rpc_url:
                raise ValueError("NEO_RPC_URL environment variable not set")
            
            self._web3 = Web3(Web3.HTTPProvider(rpc_url))
            
            if not self._web3.is_connected():
                raise ConnectionError(f"Failed to connect to Neo X Testnet at {rpc_url}")
            
            logger.info(f"Connected to Neo X Testnet at {rpc_url}")
        
        return self._web3
    
    async def execute(self, wallet_address: str, **kwargs) -> Dict[str, Any]:
        """
        Execute balance check
        
        Args:
            wallet_address: The wallet address to check balance for
        
        Returns:
            Dictionary with balance information
        """
        try:
            # Validate address format
            if not Web3.is_address(wallet_address):
                raise ValueError(f"Invalid wallet address format: {wallet_address}")
            
            # Normalize address (checksum)
            address = Web3.to_checksum_address(wallet_address)
            
            # Get balance in wei (Neo X uses 18 decimals like Ethereum)
            balance_wei = self.web3.eth.get_balance(address)
            
            # Convert to GAS/NEO (divide by 10^18)
            balance_gas = Web3.from_wei(balance_wei, 'ether')
            
            # Get block number for context
            block_number = self.web3.eth.block_number
            
            result = {
                "wallet_address": address,
                "balance_wei": str(balance_wei),
                "balance_gas": str(balance_gas),
                "balance_gas_formatted": f"{float(balance_gas):.6f}",
                "block_number": block_number,
                "network": "Neo X Testnet",
                "status": "success"
            }
            
            logger.info(f"Balance check for {address}: {balance_gas} GAS")
            return result
            
        except Exception as e:
            logger.error(f"Error checking balance for {wallet_address}: {e}")
            return {
                "wallet_address": wallet_address,
                "error": str(e),
                "status": "error"
            }


class NeoSwapTool(BaseTool):
    """
    Tool to execute token swaps on Neo X Testnet
    Currently mocks the swap but sets up Web3 structure for future contract integration
    """
    
    def __init__(self, **kwargs):
        super().__init__(
            name="neo_swap",
            description="Execute a token swap on Neo X Testnet (EVM). Currently mocked but ready for contract integration.",
            parameters={
                "type": "object",
                "properties": {
                    "amount_in": {
                        "type": "string",
                        "description": "Amount of input token to swap (as string to handle large numbers)"
                    },
                    "token_in": {
                        "type": "string",
                        "description": "Address of the input token contract (use 'NATIVE' or '0x0000...' for GAS/NEO)"
                    },
                    "token_out": {
                        "type": "string",
                        "description": "Address of the output token contract (use 'NATIVE' or '0x0000...' for GAS/NEO)"
                    },
                    "slippage_tolerance": {
                        "type": "number",
                        "description": "Maximum acceptable slippage percentage (default: 0.5)",
                        "default": 0.5
                    },
                    "recipient": {
                        "type": "string",
                        "description": "Address to receive the output tokens (defaults to wallet address if not provided)",
                        "default": None
                    }
                },
                "required": ["amount_in", "token_in", "token_out"]
            },
            **kwargs
        )
        self._web3 = None
        self._swap_router_address = None  # Will be set when implementing actual swap
    
    @property
    def web3(self) -> Web3:
        """Lazy initialization of Web3 connection to Neo X Testnet"""
        if self._web3 is None:
            rpc_url = os.getenv('NEO_RPC_URL', 'https://testnet.neox.network:443')
            if not rpc_url:
                raise ValueError("NEO_RPC_URL environment variable not set")
            
            self._web3 = Web3(Web3.HTTPProvider(rpc_url))
            
            # Add POA middleware for Neo X (if needed)
            self._web3.middleware_onion.inject(geth_poa_middleware, layer=0)
            
            if not self._web3.is_connected():
                raise ConnectionError(f"Failed to connect to Neo X Testnet at {rpc_url}")
            
            logger.info(f"Connected to Neo X Testnet at {rpc_url}")
        
        return self._web3
    
    def _get_router_contract(self):
        """Get the swap router contract instance"""
        router_address = os.getenv('NEO_DEX_ROUTER_ADDRESS')
        if not router_address:
            raise ValueError("NEO_DEX_ROUTER_ADDRESS environment variable not set")
        
        router_address = Web3.to_checksum_address(router_address)
        contract = self.web3.eth.contract(address=router_address, abi=UNISWAP_V2_ROUTER_ABI)
        return contract
    
    async def execute(
        self,
        amount_in: str,
        token_in: str,
        token_out: str,
        slippage_tolerance: float = 0.5,
        recipient: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute token swap (currently mocked)
        
        Args:
            amount_in: Amount of input token to swap
            token_in: Input token address (or 'NATIVE' for GAS/NEO)
            token_out: Output token address (or 'NATIVE' for GAS/NEO)
            slippage_tolerance: Maximum acceptable slippage percentage
            recipient: Recipient address (optional)
        
        Returns:
            Dictionary with swap transaction details
        """
        try:
            # Validate Web3 connection
            if not self.web3.is_connected():
                raise ConnectionError("Not connected to Neo X Testnet")
            
            # Normalize token addresses
            if token_in.upper() == 'NATIVE' or token_in == '0x0000000000000000000000000000000000000000':
                token_in_address = 'NATIVE'
            else:
                if not Web3.is_address(token_in):
                    raise ValueError(f"Invalid token_in address: {token_in}")
                token_in_address = Web3.to_checksum_address(token_in)
            
            if token_out.upper() == 'NATIVE' or token_out == '0x0000000000000000000000000000000000000000':
                token_out_address = 'NATIVE'
            else:
                if not Web3.is_address(token_out):
                    raise ValueError(f"Invalid token_out address: {token_out}")
                token_out_address = Web3.to_checksum_address(token_out)
            
            # Parse amount
            try:
                amount_in_decimal = Decimal(str(amount_in))
                if amount_in_decimal <= 0:
                    raise ValueError("amount_in must be positive")
            except (ValueError, TypeError) as e:
                raise ValueError(f"Invalid amount_in: {amount_in}") from e
            
            # Safety Switch: Check if contract integration is configured
            private_key = os.getenv('NEO_PRIVATE_KEY')
            router_address = os.getenv('NEO_DEX_ROUTER_ADDRESS')
            
            if not private_key or not router_address:
                logger.warning(
                    "NEO_PRIVATE_KEY or NEO_DEX_ROUTER_ADDRESS not set. "
                    "Using mocked swap logic."
                )
                # Fall back to mock logic
                block_number = self.web3.eth.block_number
                gas_price = self.web3.eth.gas_price
                import secrets
                mock_tx_hash = f"0x{secrets.token_hex(32)}"
                mock_amount_out = str(amount_in_decimal * Decimal('0.997'))  # Mock 0.3% fee
                
                return {
                    "status": "success",
                    "message": "Swap executed (mocked - contract integration not configured)",
                    "transaction_hash": mock_tx_hash,
                    "token_in": token_in_address,
                    "token_out": token_out_address,
                    "amount_in": str(amount_in_decimal),
                    "amount_out": mock_amount_out,
                    "slippage_tolerance": slippage_tolerance,
                    "recipient": recipient or "wallet_address",
                    "block_number": block_number,
                    "gas_price": str(gas_price),
                    "network": "Neo X Testnet",
                    "note": "Mocked swap - set NEO_PRIVATE_KEY and NEO_DEX_ROUTER_ADDRESS to enable real swaps"
                }
            
            # Execute real swap contract call
            return self._execute_swap_contract(
                amount_in_decimal,
                token_in_address,
                token_out_address,
                recipient or Account.from_key(private_key).address,
                slippage_tolerance
            )
            
        except Exception as e:
            logger.error(f"Error executing swap: {e}")
            return {
                "status": "error",
                "error": str(e),
                "token_in": token_in,
                "token_out": token_out,
                "amount_in": amount_in
            }
    
    def _execute_swap_contract(
        self,
        amount_in: Decimal,
        token_in: str,
        token_out: str,
        recipient: str,
        slippage_tolerance: float
    ) -> Dict[str, Any]:
        """
        Execute actual swap contract call
        
        Args:
            amount_in: Amount to swap
            token_in: Input token address ('NATIVE' for GAS or token address)
            token_out: Output token address ('NATIVE' for GAS or token address)
            recipient: Recipient address
            slippage_tolerance: Slippage tolerance percentage
        
        Returns:
            Transaction hash and receipt
        """
        # Load account from private key
        private_key = os.getenv('NEO_PRIVATE_KEY')
        if not private_key:
            raise ValueError("NEO_PRIVATE_KEY not set")
        
        account = Account.from_key(private_key)
        wallet_address = account.address
        
        # Get router contract
        router_contract = self._get_router_contract()
        router_address = router_contract.address
        
        # Determine swap type and build path
        is_native_in = token_in == 'NATIVE'
        is_native_out = token_out == 'NATIVE'
        
        # Build token path
        if is_native_in and is_native_out:
            raise ValueError("Cannot swap NATIVE to NATIVE")
        
        # For Neo X, native GAS is typically represented as 0x0000...0000
        # You may need to use Wrapped GAS address if the DEX requires it
        # For now, we'll use the zero address as a placeholder
        NATIVE_ADDRESS = '0x0000000000000000000000000000000000000000'
        
        if is_native_in:
            path = [NATIVE_ADDRESS, Web3.to_checksum_address(token_out)]
        elif is_native_out:
            path = [Web3.to_checksum_address(token_in), NATIVE_ADDRESS]
        else:
            path = [
                Web3.to_checksum_address(token_in),
                Web3.to_checksum_address(token_out)
            ]
        
        # Convert amount to wei
        amount_in_wei = Web3.to_wei(float(amount_in), 'ether')
        
        # Get quote for minimum output (slippage protection)
        try:
            amounts_out = router_contract.functions.getAmountsOut(
                amount_in_wei,
                path
            ).call()
            amount_out_min = amounts_out[-1]  # Last element is output amount
            # Apply slippage tolerance
            amount_out_min = int(amount_out_min * (100 - slippage_tolerance) / 100)
        except Exception as e:
            logger.warning(f"Could not get quote, using estimated amount: {e}")
            # Fallback: estimate with 0.3% fee and slippage
            amount_out_min = int(amount_in_wei * Decimal('0.997') * (100 - slippage_tolerance) / 100)
        
        # Deadline (30 minutes from now)
        deadline = int(time.time()) + 1800
        
        # Get nonce and gas price
        nonce = self.web3.eth.get_transaction_count(wallet_address)
        gas_price = self.web3.eth.gas_price
        
        # Approve token if swapping a token (not native)
        if not is_native_in:
            token_contract = self.web3.eth.contract(
                address=Web3.to_checksum_address(token_in),
                abi=ERC20_ABI
            )
            
            # Check allowance
            allowance = token_contract.functions.allowance(
                wallet_address,
                router_address
            ).call()
            
            if allowance < amount_in_wei:
                logger.info(f"Approving token {token_in} for router {router_address}")
                # Build approve transaction
                approve_tx = token_contract.functions.approve(
                    router_address,
                    amount_in_wei * 2  # Approve 2x for safety
                ).build_transaction({
                    'from': wallet_address,
                    'gas': 100000,
                    'gasPrice': gas_price,
                    'nonce': nonce,
                    'chainId': self.web3.eth.chain_id
                })
                
                # Sign and send approve
                signed_approve = account.sign_transaction(approve_tx)
                approve_tx_hash = self.web3.eth.send_raw_transaction(signed_approve.rawTransaction)
                logger.info(f"Approve transaction sent: {approve_tx_hash.hex()}")
                
                # Wait for approval
                self.web3.eth.wait_for_transaction_receipt(approve_tx_hash)
                nonce += 1  # Increment nonce for next transaction
        
        # Build swap transaction
        if is_native_in:
            # swapExactETHForTokens
            swap_tx = router_contract.functions.swapExactETHForTokens(
                amount_out_min,
                path,
                recipient,
                deadline
            ).build_transaction({
                'from': wallet_address,
                'value': amount_in_wei,
                'gas': 300000,
                'gasPrice': gas_price,
                'nonce': nonce,
                'chainId': self.web3.eth.chain_id
            })
        elif is_native_out:
            # swapExactTokensForETH
            swap_tx = router_contract.functions.swapExactTokensForETH(
                amount_in_wei,
                amount_out_min,
                path,
                recipient,
                deadline
            ).build_transaction({
                'from': wallet_address,
                'gas': 300000,
                'gasPrice': gas_price,
                'nonce': nonce,
                'chainId': self.web3.eth.chain_id
            })
        else:
            # swapExactTokensForTokens
            swap_tx = router_contract.functions.swapExactTokensForTokens(
                amount_in_wei,
                amount_out_min,
                path,
                recipient,
                deadline
            ).build_transaction({
                'from': wallet_address,
                'gas': 300000,
                'gasPrice': gas_price,
                'nonce': nonce,
                'chainId': self.web3.eth.chain_id
            })
        
        # Estimate gas (optional, but recommended)
        try:
            estimated_gas = self.web3.eth.estimate_gas(swap_tx)
            swap_tx['gas'] = int(estimated_gas * 1.2)  # Add 20% buffer
        except Exception as e:
            logger.warning(f"Gas estimation failed, using default: {e}")
        
        # Sign transaction
        signed_tx = account.sign_transaction(swap_tx)
        
        # Send transaction
        tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        logger.info(f"Swap transaction sent: {tx_hash.hex()}")
        
        # Wait for confirmation
        receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash, timeout=300)
        
        # Get actual amount out from receipt logs (if available)
        amount_out_actual = amount_out_min  # Default to minimum
        if receipt.logs:
            # Try to extract amount from event logs
            # This is a simplified version - you may need to parse Transfer events
            pass
        
        return {
            "status": "success",
            "message": "Swap executed successfully",
            "transaction_hash": tx_hash.hex(),
            "token_in": token_in,
            "token_out": token_out,
            "amount_in": str(amount_in),
            "amount_out_min": str(Web3.from_wei(amount_out_min, 'ether')),
            "slippage_tolerance": slippage_tolerance,
            "recipient": recipient,
            "block_number": receipt.blockNumber,
            "gas_used": receipt.gasUsed,
            "network": "Neo X Testnet",
            "receipt": {
                "status": receipt.status,
                "blockNumber": receipt.blockNumber,
                "transactionHash": receipt.transactionHash.hex()
            }
        }

