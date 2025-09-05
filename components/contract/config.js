import { ethers } from "ethers";
import abi from "./abi.json";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const contractABI = abi

export const contract = new ethers.Contract(
  contractAddress,
  contractABI,
  signer
);

