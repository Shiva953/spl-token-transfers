"use client"

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import type { TransactionSignature } from '@solana/web3.js';
import { PublicKey, SystemProgram, Transaction, Connection, clusterApiUrl } from '@solana/web3.js';
import React, { FC, useCallback, useState } from 'react';
import { useToast } from "@/components/ui/use-toast"
import { Button } from './ui/button';
import { Input } from './ui/input';
import Link from 'next/link';
import {createMintToInstruction, createAssociatedTokenAccount, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getOrCreateAssociatedTokenAccount, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID} from "@solana/spl-token"


export default function MintForm(){
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { toast } = useToast()
    const [associatedTokenAccount, setAssociatedTokenAccount] = useState<string | null>(null)

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        let signature: TransactionSignature | undefined = undefined;
        try{
          if (!publicKey) throw new WalletNotConnectedError();
  
              const mint = new PublicKey(e.target.mint.value);
              const recipient = new PublicKey(e.target.recipient.value);
              const mintAmount = e.target.mintAmount.value;
  
              const associatedToken = await getAssociatedTokenAddress(
                mint,
                recipient,
                false,
                TOKEN_2022_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
              );
            console.log(associatedToken.toString())
              const transaction = new Transaction().add(
                  createMintToInstruction(
                    mint,
                    associatedToken,
                    publicKey,
                    mintAmount * 10 ** 2,
                    [publicKey],
                    TOKEN_2022_PROGRAM_ID
                  )
              );
              setAssociatedTokenAccount(associatedToken.toString())
              const {
                  context: { slot: minContextSlot },
                  value: { blockhash, lastValidBlockHeight }
              } = await connection.getLatestBlockhashAndContext();
  
            signature = await sendTransaction(transaction, connection, { minContextSlot });
            toast({
              title: "Confirming Transaction...",
            })
            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            if(signature)
              {
                console.log('Transaction successful!', signature)
                toast({
                  title: "Transaction Confirmed!",
                  action: <Button><Link href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}>Show In Explorer</Link></Button>
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

      const buttonAction = async(e:any) => {
        console.log(e)
        const mint = new PublicKey(e.target.mint.value)
        const owner = new PublicKey(e.target.recipient.value)
        const associatedToken = await getAssociatedTokenAddress(
          mint,
          owner,
          false,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        const associatedTokenAccount = associatedToken.toString();
        toast({
          title: "Token Account",
          description: ``,
          action: <Button><Link href={`https://explorer.solana.com/tx/${associatedTokenAccount}?cluster=devnet`}>Show In Explorer</Link></Button>
        })
      }

      return(
        <>
        <form onSubmit={handleSubmit} autoComplete='off' className="flex flex-col items-center">
        <h2 className="flex-col mb-4 justify-between text-1xl md:text-2xl lg:text-3xl m-2 font-bold leading-none tracking-tight text-gray-900 dark:text-white"><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-sky-400">Mint Tokens</span></h2>
                <p className="mb-2">
                  Token Mint Address
                </p>
                <Input
                  type="text"
                  id="mint"
                  className="px-4 py-2 mb-4 w-96"
                  placeholder="Token Mint Address"
                  required
                />
                <label htmlFor="walletAddress" className="mb-2">
                  Recepient
                </label>
                <Input
                  type="text"
                  id="recipient"
                  autoComplete='off'
                  className="px-4 py-2 mb-4 w-96"
                  placeholder="Enter recipient wallet address"
                  required
                />
                <p className="mb-2">
                  Number of tokens to mint
                </p>
                <Input
                  type="number"
                  id="mintAmount"
                  className="px-4 py-2 mb-4 w-96"
                  placeholder="Enter amount"
                  required
                />
                <Button type="submit" disabled={!publicKey} className="px-4 py-2 rounded">
                  Mint Tokens
                </Button>
                {associatedTokenAccount ? <div>Associated Token Account : {associatedTokenAccount}</div> : <div></div>}
              </form>
        </>
      )
}