import { contract } from "@/components/contract/config";

// Withdraw platform fees (onlyOwner)
export async function withdrawFees() {
  const tx = await contract.withdrawFees();
  return tx.wait();
}

// Set platform fee
export async function setPlatformFeePct(newPct) {
  const tx = await contract.setPlatformFeePct(newPct);
  return tx.wait();
}

// Update metadata URI
export async function setTokenURI(tokenId, newUri) {
  const tx = await contract.setTokenURI(tokenId, newUri);
  return tx.wait();
}
