"use client"

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import React, { FC, useCallback, useState } from 'react';
import { useToast } from "@/components/ui/use-toast"
import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';

export default function Transfer(){
    const [amount, setAmount] = useState(0.00009);
    const [walletAddress, setWalletAddress] = useState('');

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { toast } = useToast()

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAmount(parseFloat(e.target.value));
    };

    
    const handleWalletAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setWalletAddress(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      console.log('Amount:', amount);
      console.log('Wallet Address:', walletAddress);
      let signature: TransactionSignature | undefined = undefined;
      try{
        if (!publicKey) throw new WalletNotConnectedError();

            console.log(publicKey.toBase58())
            const lamports = amount * LAMPORTS_PER_SOL;

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(walletAddress),
                    lamports,
                })
            );

            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();

            signature = await sendTransaction(transaction, connection, { minContextSlot });
            if(signature){
            toast({
              title: "Confirming Transaction...",
            })
          }
            const confirmation = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            if(confirmation)
              {
                console.log('Transaction successful!', signature)
                toast({
                  title: "Transaction Confirmed!",
                  action: <Button><Link href={`https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`}>Show In Explorer</Link></Button>
                })
            }
        }
        catch(error: any){
          toast(
            {
              title: "Error - Transaction Failed!",
              description: `${error?.message}`
            }
          )
        }
    };

  return(
    <>
    <form onSubmit={handleSubmit} autoComplete='off' className="flex flex-col items-center">
    <h2 className="flex-col mb-4 justify-center text-1xl md:text-2xl lg:text-3xl m-2 font-bold leading-none tracking-tight text-gray-900 dark:text-white"><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-purple-400">Transfer Sol</span></h2>
                <p className="mb-2">
                  Enter Amount of SOL
                </p>
                <Input
                  type="number"
                  id="amount"
                  value={amount}
                  onChange={handleAmountChange}
                  className="px-4 py-2 mb-4"
                  placeholder="Enter amount"
                  required
                />
                <label htmlFor="walletAddress" className="mb-2">
                  Enter Wallet Address to Send to
                </label>
                <Input
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  autoComplete='off'
                  onChange={handleWalletAddressChange}
                  className="px-4 py-2 mb-4 w-96"
                  placeholder="Enter wallet address"
                  required
                />
                <Button type="submit" disabled={!publicKey} className="px-4 py-2 rounded">
                  Send
                </Button>
              </form>
              {/* <form onSubmit={handleTokenMintSubmit} autoComplete='off' className="flex flex-col items-center">
                <p>Token Mint Address</p>
                <input
                  type="text"
                  id="mint"
                  autoComplete='off'
                  className="border border-gray-400 rounded px-4 py-2 mb-4 text-black"
                  placeholder="Enter token mint address"
                  required
                />
                <p>Token Account Owner Address</p>
                <input
                  type="text"
                  id="owner"
                  autoComplete='off'
                  className="border border-gray-400 rounded px-4 py-2 mb-4 text-black"
                  placeholder="Enter token account owner address"
                  required
                />
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                  Create Associated Token Account
                </button>
                <p>{associatedTokenAccount}</p>
              </form> */}
              </>
  )
}