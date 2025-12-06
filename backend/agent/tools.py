"""
SpoonOS Tools for Neo X Testnet (EVM)
Tools for interacting with Neo blockchain via Web3
"""
import os
import logging
from typing import Dict, Any, Optional
from decimal import Decimal

from web3 import Web3
from spoon_ai.tools.base import BaseTool

logger = logging.getLogger(__name__)


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
            
            if not self._web3.is_connected():
                raise ConnectionError(f"Failed to connect to Neo X Testnet at {rpc_url}")
            
            logger.info(f"Connected to Neo X Testnet at {rpc_url}")
        
        return self._web3
    
    def _get_swap_router_address(self) -> Optional[str]:
        """Get the swap router contract address (to be configured)"""
        # TODO: Set this from environment variable or config
        # Example: return os.getenv('NEO_SWAP_ROUTER_ADDRESS')
        return self._swap_router_address
    
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
            
            # Get current block for context
            block_number = self.web3.eth.block_number
            gas_price = self.web3.eth.gas_price
            
            # TODO: Implement actual swap contract call
            # Example structure:
            # 1. Load swap router ABI
            # 2. Create contract instance
            # 3. Build swap transaction
            # 4. Estimate gas
            # 5. Sign and send transaction
            # 6. Wait for confirmation
            
            # Mock swap result for now
            import secrets
            mock_tx_hash = f"0x{secrets.token_hex(32)}"
            mock_amount_out = str(amount_in_decimal * Decimal('0.997'))  # Mock 0.3% fee
            
            result = {
                "status": "success",
                "message": "Swap executed (mocked - contract integration pending)",
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
                "note": "This is a mocked swap. Implement contract call in _execute_swap_contract() method"
            }
            
            logger.info(
                f"Swap executed (mocked): {amount_in} {token_in_address} -> {mock_amount_out} {token_out_address}"
            )
            logger.warning("NeoSwapTool is using mocked swap logic. Implement contract integration.")
            
            return result
            
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
        Execute actual swap contract call (to be implemented)
        
        This method should:
        1. Load the swap router contract ABI
        2. Create contract instance
        3. Build the swap transaction with proper parameters
        4. Estimate gas
        5. Sign transaction (using wallet/signer)
        6. Send transaction
        7. Wait for confirmation
        8. Return transaction hash and receipt
        
        Args:
            amount_in: Amount to swap
            token_in: Input token address
            token_out: Output token address
            recipient: Recipient address
            slippage_tolerance: Slippage tolerance percentage
        
        Returns:
            Transaction hash and receipt
        """
        # TODO: Implement actual contract call
        # Example structure:
        #
        # router_address = self._get_swap_router_address()
        # router_abi = self._load_router_abi()  # Load from file or config
        # contract = self.web3.eth.contract(address=router_address, abi=router_abi)
        #
        # # Build swap parameters
        # swap_params = {
        #     'tokenIn': token_in,
        #     'tokenOut': token_out,
        #     'amountIn': amount_in,
        #     'amountOutMinimum': calculate_min_amount_out(amount_in, slippage_tolerance),
        #     'recipient': recipient,
        #     'deadline': int(time.time()) + 1800  # 30 minutes
        # }
        #
        # # Build transaction
        # tx = contract.functions.swapExactTokensForTokens(**swap_params).build_transaction({
        #     'from': wallet_address,
        #     'gas': estimated_gas,
        #     'gasPrice': gas_price,
        #     'nonce': nonce
        # })
        #
        # # Sign and send
        # signed_tx = wallet.sign_transaction(tx)
        # tx_hash = self.web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        # receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
        #
        # return {
        #     'transaction_hash': tx_hash.hex(),
        #     'receipt': receipt
        # }
        
        raise NotImplementedError("Contract swap integration not yet implemented")

