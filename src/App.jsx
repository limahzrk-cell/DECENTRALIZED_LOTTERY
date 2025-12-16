import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractConfig";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState("0");
  const [playersCount, setPlayersCount] =useState("0");
  const [loading, setLoading] =useState(false);
  const [status, setStatus] = useState("");
const [owner, setOwner] =useState("");

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
    const bal = await provider.getBalance(CONTRACT_ADDRESS);
    setBalance(ethers.formatEther(bal));

    const signer = await provider.getSigner();
    const lotteryContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    setContract(lotteryContract);
    await fetchLotteryData();
  };

  const fetchLotteryData = async () => {
  if (!contract) return;

  const count = await contract.getPlayersCount();
  setPlayersCount(count.toString());

  const provider = new ethers.BrowserProvider(window.ethereum);
  const bal = await provider.getBalance(CONTRACT_ADDRESS);
  setBalance(ethers.formatEther(bal));

  const ownerAddress = await contract.owner();
  setOwner(ownerAddress);
};

  const enterLottery = async () => {
  if (!contract) return alert("Connect wallet first");

  try {
    setLoading(true);
    setStatus("⏳ Buying ticket...");

    const tx = await contract.enter({
      value: ethers.parseEther("0.01"),
    });
    await tx.wait();

    setStatus("🎉 Ticket purchased successfully!");
    await fetchLotteryData();
  } catch (err) {
    setStatus("❌ Transaction failed");
  } finally {
    setLoading(false);
  }
};

  const pickWinner = async () => {
  if (!contract) return alert("Connect wallet first");

  try {
    setLoading(true);
    setStatus("🎲 Picking winner...");

    const tx = await contract.pickWinner();
    await tx.wait();

    setStatus("🏆 Winner selected!");
    await fetchLotteryData();
  } catch (err) {
    setStatus("❌ Failed to pick winner");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>🎰 Decentralized Lottery</h1>

<p><strong>💰 Prize Pool:</strong> {balance} ETH</p>
<p><strong>👥 Players:</strong> {playersCount}</p>

{status && <p>{status}</p>}

<hr />

{!account ? (
  <button onClick={connectWallet}>🔌 Connect Wallet</button>
) : (
  <p>
    🔗 Connected: {account.slice(0, 6)}...{account.slice(-4)}
  </p>
)}

<br />

<button onClick={enterLottery} disabled={!account || loading}>
  {loading ? "Processing..." : "Buy Ticket (0.01 ETH)"}
</button>

<br /><br />

{/* Show only to owner */}
{account.toLowerCase() === owner.toLowerCase() && (
  <button onClick={pickWinner} disabled={loading}>
    🎯 Pick Winner (Owner)
  </button>
)}
    </div>
  );
}

export default App;