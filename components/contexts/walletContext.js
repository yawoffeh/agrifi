"use client";

import toast from "react-hot-toast";
import ABI from "../contract/abi.json";
import { ethers } from "ethers";
import { createContext, useContext, useState } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  // Connect Wallet
  const connect = async () => {
    toast.loading("Connecting Wallet ......", { position: "top-center" });
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setWalletAddress(accounts[0]);
      localStorage.setItem("account", accounts[0]);
      setWalletConnected(true);
      toast.dismiss();
      toast.success("Wallet Connected", { position: "top-center" });
    } catch (error) {
      setWalletConnected(false);
      console.log(error);
      toast.dismiss();
      toast.error("Wallet connection failed", { position: "top-center" });
    }
  };

  // Disconnect Wallet
  const disconnect = () => {
    setWalletAddress(null);
    setWalletConnected(false);
    localStorage.removeItem("account");
  };

  // Get contract instance
  const getContract = async () => {
    if (!window.ethereum) {
      toast.error("No wallet detected");
      return null;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    return new ethers.Contract(contractAddress, ABI, signer);
  };

  // ---------------------------
  // FARMER FUNCTIONS
  // ---------------------------

  const registerFarmer = async (ensName, name, location) => {
    try {
      const contract = await getContract();
      const tx = await contract.registerFarmer(ensName, name, location);
      
      toast.success("Farmer registered successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Farmer registration failed");
    }
  };

  const tokenizeCrop = async (
    cropType,
    variety,
    totalSupply,
    pricePerToken,
    harvestDate,
    carbonCredits,
    metadataURI
  ) => {
    try {
      const contract = await getContract();
      const tx = await contract.tokenizeCrop(
        cropType,
        variety,
        totalSupply,
        pricePerToken,
        harvestDate,
        carbonCredits,
        metadataURI
      );
      
      toast.success("Crop tokenized successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Crop tokenization failed");
    }
  };

  const completeHarvest = async (cropId, actualYield) => {
    try {
      const contract = await getContract();
      const tx = await contract.completeHarvest(cropId, actualYield);
      
      toast.success("Harvest completed!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete harvest");
    }
  };

  // ---------------------------
  // INVESTOR FUNCTIONS
  // ---------------------------

  const investInCrop = async (cropId, tokenAmount, pricePerToken) => {
    try {
      const contract = await getContract();
      const totalCost = ethers.parseEther(
        (Number(tokenAmount) * Number(pricePerToken)).toFixed(18)
      );
      const tx = await contract.investInCrop(cropId, tokenAmount, {
        value: totalCost,
      });
      
      toast.success("Investment successful!");
    } catch (error) {
      console.error(error);
      toast.error("Investment failed");
    }
  };

  const getCropToken = async (cropId) => {
    try {
      const contract = await getContract();
      return await contract.getCropToken(cropId);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getActiveCrops = async () => {
    try {
      const contract = await getContract();
      return await contract.getActiveCrops();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getRegisteredFarmers = async () => {
    try {
      const contract = await getContract();
      return await contract.getRegisteredFarmers();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const getFarmer = async (farmerAddress) => {
    try {
      const contract = await getContract();
      return await contract.getFarmer(farmerAddress);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const getInvestment = async (cropId, investor) => {
    try {
      const contract = await getContract();
      return await contract.getInvestment(cropId, investor);
    } catch (error) {
      console.error(error);
      return 0;
    }
  };

  const getInvestorHistory = async (investor) => {
    try {
      const contract = await getContract();
      return await contract.getInvestorHistory(investor);
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // ---------------------------
  // PLATFORM (OWNER) FUNCTIONS
  // ---------------------------

  const withdrawFees = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.withdrawFees();
      
      toast.success("Platform fees withdrawn!");
    } catch (error) {
      console.error(error);
      toast.error("Withdraw failed");
    }
  };

  const setPlatformFeePct = async (newPct) => {
    try {
      const contract = await getContract();
      const tx = await contract.setPlatformFeePct(newPct);
      
      toast.success("Platform fee updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update fee");
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletConnected,
        connect,
        disconnect,
        getContract,
        registerFarmer,
        tokenizeCrop,
        completeHarvest,
        investInCrop,
        getCropToken,
        getActiveCrops,
        getRegisteredFarmers,
        getFarmer,
        getInvestment,
        getInvestorHistory,
        withdrawFees,
        setPlatformFeePct,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => useContext(WalletContext);
