"use client"

import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { FiInfo } from "react-icons/fi"
import { useWalletContext } from "@/components/contexts/walletContext"
import { ethers } from "ethers";

export default function TokenizePage() {
  const { getContract } = useWalletContext()
  const [form, setForm] = useState({
    cropType: "",
    customCropType: "",
    variety: "",
    customVariety: "",
    totalSupply: "",
    pricePerToken: "",
    harvestDate: "",
    carbonCredits: "",
    image: null as File | null,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const cropOptions = ["Maize", "Cocoa", "Rice", "Cassava", "Other"]
  const varietyOptions = ["Hybrid", "Organic", "Drought-resistant", "Other"]

  const handleChange = (e: any) => {
    const { name, value, files } = e.target
    if (files) {
      const file = files[0]
      setForm({ ...form, [name]: file })
      setPreview(URL.createObjectURL(file))
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = async (e: any) => {
  e.preventDefault()

  // --- Validate before anything ---
  const cropType = form.cropType === "Other" ? form.customCropType : form.cropType
  const variety = form.variety === "Other" ? form.customVariety : form.variety

  if (!cropType) {
    toast.error("Please select or enter a crop type")
    return
  }
  if (!variety) {
    toast.error("Please select or enter a crop variety")
    return
  }
  if (!form.totalSupply || Number(form.totalSupply) <= 0) {
    toast.error("Total supply must be greater than 0")
    return
  }
  if (!form.pricePerToken || Number(form.pricePerToken) <= 0) {
    toast.error("Price per token must be greater than 0")
    return
  }
  if (!form.harvestDate) {
    toast.error("Please select a harvest date")
    return
  }
  const harvestTimestamp = Math.floor(new Date(form.harvestDate).getTime() / 1000)
  if (harvestTimestamp <= Math.floor(Date.now() / 1000)) {
    toast.error("Harvest date must be in the future")
    return
  }
  if (!form.carbonCredits || Number(form.carbonCredits) < 0) {
    toast.error("Carbon credits cannot be negative")
    return
  }
  if (!form.image) {
    toast.error("Please upload a crop image")
    return
  }

  setLoading(true)
  toast.loading("Uploading crop data...")

  try {
    // --- 1. upload image ---
    const imgForm = new FormData()
    imgForm.append("image", form.image!)
    const imgRes = await axios.post("https://3.255.226.198.sslip.io/image/upload", imgForm, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    const imageUrl = imgRes.data.imageUrl

    // --- 2. create metadata ---
    const metadata = {
      name: `${cropType} - ${variety}`,
      description: `Token representing ${cropType} (${variety})`,
      image: imageUrl,
      attributes: [
        { trait_type: "Harvest Date", value: form.harvestDate },
        { trait_type: "Carbon Credits", value: form.carbonCredits },
      ],
    }

    const metaForm = new FormData()
    metaForm.append("image", new Blob([JSON.stringify(metadata)], { type: "application/json" }), "metadata.json")
    const metaRes = await axios.post("https://3.255.226.198.sslip.io/image/upload", metaForm)
    const metadataUrl = metaRes.data.imageUrl

    // --- 3. call contract ---
    const contract = await getContract()

    toast.loading("Submitting to blockchain...")
    const tx = await contract.tokenizeCrop(
      cropType,
      variety,
      BigInt(form.totalSupply),
      ethers.parseEther(form.pricePerToken.toString()),
      BigInt(harvestTimestamp),
      BigInt(form.carbonCredits),
      metadataUrl
    )

    toast.dismiss()
    toast.success("Crop tokenized successfully 🎉")

    // reset form
    setForm({
      cropType: "",
      customCropType: "",
      variety: "",
      customVariety: "",
      totalSupply: "",
      pricePerToken: "",
      harvestDate: "",
      carbonCredits: "",
      image: null,
    })
    setPreview(null)

  } catch (err: any) {
    console.error(err)
    toast.dismiss()
    toast.error(err?.reason || "Failed to tokenize crop ❌")
  } finally {
    setLoading(false)
  }
}


  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Tokenize Crop</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Crop Type */}
            <div>
              <Label htmlFor="cropType" className="flex items-center gap-2">
                Crop Type <FiInfo title="Type of crop (e.g., Maize, Cocoa, Rice)" />
              </Label>
              <select
                id="cropType"
                name="cropType"
                value={form.cropType}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              >
                <option value="">Select crop type</option>
                {cropOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              {form.cropType === "Other" && (
                <Input
                  className="mt-2"
                  placeholder="Enter crop type"
                  name="customCropType"
                  value={form.customCropType}
                  onChange={handleChange}
                />
              )}
            </div>

            {/* Variety */}
            <div>
              <Label htmlFor="variety" className="flex items-center gap-2">
                Variety <FiInfo title="Specific crop variety (e.g., Organic, Hybrid)" />
              </Label>
              <select
                id="variety"
                name="variety"
                value={form.variety}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                required
              >
                <option value="">Select variety</option>
                {varietyOptions.map((opt, i) => (
                  <option key={i} value={opt}>{opt}</option>
                ))}
              </select>
              {form.variety === "Other" && (
                <Input
                  className="mt-2"
                  placeholder="Enter crop variety"
                  name="customVariety"
                  value={form.customVariety}
                  onChange={handleChange}
                />
              )}
            </div>

            {/* Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalSupply" className="flex items-center gap-2">
                  Total Supply <FiInfo title="Number of crop tokens to mint" />
                </Label>
                <Input id="totalSupply" type="number" name="totalSupply" value={form.totalSupply} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="pricePerToken" className="flex items-center gap-2">
                  Price per Token <FiInfo title="Price per token in Wei (ETH smallest unit)" />
                </Label>
                <Input id="pricePerToken" type="number" name="pricePerToken" value={form.pricePerToken} onChange={handleChange} required />
              </div>
            </div>

            {/* Harvest Date */}
            <div>
              <Label htmlFor="harvestDate" className="flex items-center gap-2">
                Harvest Date <FiInfo title="Expected date of harvest" />
              </Label>
              <Input id="harvestDate" type="date" name="harvestDate" value={form.harvestDate} onChange={handleChange} required />
            </div>

            {/* Carbon Credits */}
            <div>
              <Label htmlFor="carbonCredits" className="flex items-center gap-2">
                Carbon Credits <FiInfo title="Carbon credits earned from sustainable farming" />
              </Label>
              <Input id="carbonCredits" type="number" name="carbonCredits" value={form.carbonCredits} onChange={handleChange} required />
            </div>

            {/* Image Upload */}
            <div>
              <Label htmlFor="image" className="flex items-center gap-2">
                Upload Crop Image <FiInfo title="Photo of the crop or farm" />
              </Label>
              <Input id="image" type="file" accept="image/*" name="image" onChange={handleChange} required />
              {preview && (
                <div className="mt-3">
                  <Image src={preview} alt="Preview" width={400} height={250} className="rounded-lg border" />
                </div>
              )}
            </div>

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Processing..." : "Tokenize Crop"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
