import { contract } from "./config";

// Register a farmer
export async function registerFarmer(ensName, name, location) {
  const tx = await contract.registerFarmer(ensName, name, location);
  return tx.wait();
}

// Tokenize a crop (mint new ERC1155 with metadata URI on IPFS)
export async function tokenizeCrop(cropType, variety, totalSupply, pricePerToken, harvestDate, carbonCredits, metadataURI) {
  const tx = await contract.tokenizeCrop(
    cropType,
    variety,
    totalSupply,
    pricePerToken,
    harvestDate,
    carbonCredits,
    metadataURI
  );
  const receipt = await tx.wait();
  // Extract cropId from event logs if needed
  return receipt;
}

// Complete harvest
export async function completeHarvest(cropId, actualYield) {
  const tx = await contract.completeHarvest(cropId, actualYield);
  return tx.wait();
}

// Get farmer details
export async function getFarmer(address) {
  return contract.getFarmer(address);
}
