import { contract } from "@/components/contract/config";
import { ethers } from "ethers";

// Invest in a crop
export async function investInCrop(cropId, tokenAmount, pricePerToken) {
  const totalCost = ethers.BigNumber.from(pricePerToken).mul(tokenAmount);
  const tx = await contract.investInCrop(cropId, tokenAmount, { value: totalCost });
  return tx.wait();
}

// Get investment in a crop
export async function getInvestment(cropId, investor) {
  return contract.getInvestment(cropId, investor);
}

// Get full investment history
export async function getInvestorHistory(investor) {
  return contract.getInvestorHistory(investor);
}
