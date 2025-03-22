import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";
import { decryptPrivateKey } from "./encryption";

// ✅ Testnet/mainnet flag
const isTestnet = process.env.NEXT_PUBLIC_TESTNET === "true";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const RPC_URL = isTestnet
  ? process.env.NEXT_PUBLIC_BSC_TESTNET_RPC
  : process.env.NEXT_PUBLIC_BSC_RPC;

export const EXPLORER_URL = isTestnet
  ? "https://testnet.bscscan.com/tx/"
  : "https://bscscan.com/tx/";

export const CHAIN_ID = isTestnet ? 97 : 56;
export const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

export const provider = new ethers.JsonRpcProvider(RPC_URL);

// ✅ Get balance from chain
export const getBlockchainBalance = async (walletAddress) => {
  try {
    const balance = await provider.getBalance(walletAddress);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("❌ Blockchain balance error:", error);
    return "0.00";
  }
};

// ✅ Get DB balance
export const getDatabaseBalance = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return parseFloat(data.balance).toFixed(8);
  } catch (error) {
    console.error("❌ DB balance error:", error);
    return "0.00";
  }
};

// ✅ Send BNB transaction (with optional decryption)
export const sendTransaction = async (userId, privateKeyEncOrRaw, to, amount, nonce = null) => {
  try {
    const dbBalance = await getDatabaseBalance(userId);
    const weiAmount = ethers.parseEther(amount.toString());
    const fee = weiAmount.mul(3).div(100);
    const netAmount = weiAmount.sub(fee);

    if (netAmount.lte(0)) throw new Error("⚠ Too small after 3% fee.");
    if (parseFloat(dbBalance) < parseFloat(amount)) throw new Error("⚠ Insufficient DB balance.");

    let privateKey;
    if (nonce) {
      privateKey = await decryptPrivateKey(privateKeyEncOrRaw, nonce);
    } else {
      privateKey = privateKeyEncOrRaw;
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const chainBalance = await getBlockchainBalance(wallet.address);
    if (parseFloat(chainBalance) < parseFloat(amount)) throw new Error("⚠ Insufficient blockchain balance.");

    const tx1 = await wallet.sendTransaction({
      to,
      value: netAmount,
      gasLimit: 21000,
    });

    const tx2 = await wallet.sendTransaction({
      to: ADMIN_WALLET,
      value: fee,
      gasLimit: 21000,
    });

    await tx1.wait();
    await tx2.wait();

    await updateDatabaseBalance(userId, amount);
    await logTransaction(userId, wallet.address, to, amount, tx1.hash, "BNB");

    return {
      success: true,
      hash: `${EXPLORER_URL}${tx1.hash}`,
      feeHash: `${EXPLORER_URL}${tx2.hash}`,
    };
  } catch (error) {
    console.error("❌ Transaction error:", error);
    return { success: false, error: error.message };
  }
};

// ✅ Update balance
export const updateDatabaseBalance = async (userId, amount) => {
  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error) throw error;

    const current = parseFloat(data.balance);
    const newBalance = current - parseFloat(amount);

    await supabase
      .from("wallets")
      .update({ balance: newBalance })
      .eq("user_id", userId);

    console.log(`✅ DB updated: ${newBalance.toFixed(8)} BNB`);
  } catch (error) {
    console.error("❌ DB update error:", error);
  }
};

// ✅ Insert to logs table
export const logTransaction = async (userId, sender, receiver, amount, hash, type = "BNB") => {
  try {
    await supabase.from("logs").insert([
      {
        user_id: userId,
        sender_address: sender,
        receiver_address: receiver,
        tx_hash: hash,
        network: isTestnet ? "BSC-Testnet" : "BSC-Mainnet",
        type,
        amount,
        status: "success",
      },
    ]);
  } catch (error) {
    console.error("❌ Log insert error:", error);
  }
};

// ✅ Check network
export const checkNetwork = async () => {
  try {
    const net = await provider.getNetwork();
    return net.chainId === CHAIN_ID;
  } catch (error) {
    console.error("❌ Network error:", error);
    return false;
  }
};

// ✅ Latest block
export const getLatestBlock = async () => {
  try {
    return await provider.getBlockNumber();
  } catch (error) {
    console.error("❌ Block error:", error);
    return null;
  }
};
