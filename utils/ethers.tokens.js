import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";
import { provider, EXPLORER_URL, ADMIN_WALLET } from "./ethers";
import { decryptPrivateKey } from "./encryption";

// ✅ Supabase klientas log'ams
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ✅ ERC20 ABI
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

// ✅ Token balanso gavimas
export const getTokenBalance = async (tokenAddress, walletAddress) => {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [rawBalance, decimals] = await Promise.all([
      contract.balanceOf(walletAddress),
      contract.decimals(),
    ]);
    return ethers.formatUnits(rawBalance, decimals);
  } catch (error) {
    console.error("❌ Token balanso klaida:", error);
    return "0.00";
  }
};

// ✅ Token simbolio gavimas
export const getTokenSymbol = async (tokenAddress) => {
  try {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    return await contract.symbol();
  } catch (error) {
    console.error("❌ Simbolio klaida:", error);
    return "TOKEN";
  }
};

// ✅ Token siuntimas su 3% fee
export const sendTokenTransaction = async ({
  encryptedKey,
  nonce,
  tokenAddress,
  recipient,
  amount,
  userId = null,
}) => {
  try {
    // ✅ Dešifruojame privatų raktą
    const privateKey = await decryptPrivateKey(encryptedKey, nonce);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

    // ✅ Gauti token info
    const [decimals, symbol] = await Promise.all([
      contract.decimals(),
      contract.symbol(),
    ]);

    const rawAmount = ethers.parseUnits(amount.toString(), decimals);
    const fee = rawAmount.mul(3).div(100);
    const userAmount = rawAmount.sub(fee);

    if (userAmount.lte(0)) {
      throw new Error("⚠ Amount too small after 3% fee.");
    }

    // ✅ Transakcija: vartotojui
    const tx1 = await contract.transfer(recipient, userAmount);
    await tx1.wait();

    // ✅ Transakcija: admin fee
    const tx2 = await contract.transfer(ADMIN_WALLET, fee);
    await tx2.wait();

    // ✅ Transakcijos log į Supabase
    if (userId) {
      await supabase.from("logs").insert([
        {
          user_id: userId,
          type: "send_token",
          description: `Token ${symbol} sent to ${recipient}`,
          metadata: JSON.stringify({
            token: symbol,
            tokenAddress,
            amount: ethers.formatUnits(userAmount, decimals),
            fee: ethers.formatUnits(fee, decimals),
            hash: tx1.hash,
            feeHash: tx2.hash,
          }),
        },
      ]);
    }

    return {
      success: true,
      token: symbol,
      amount: ethers.formatUnits(userAmount, decimals),
      fee: ethers.formatUnits(fee, decimals),
      total: ethers.formatUnits(rawAmount, decimals),
      hash: `${EXPLORER_URL}${tx1.hash}`,
      feeHash: `${EXPLORER_URL}${tx2.hash}`,
    };
  } catch (error) {
    console.error("❌ Token transakcijos klaida:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
