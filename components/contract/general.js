import { contract } from "@/components/contract/config";

// Get crop details
export async function getCropToken(cropId) {
  return contract.getCropToken(cropId);
}

// Get all active crops
export async function getActiveCrops() {
  return contract.getActiveCrops();
}

// Get all registered farmers
export async function getRegisteredFarmers() {
  return contract.getRegisteredFarmers();
}
