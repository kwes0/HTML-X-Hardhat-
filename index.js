import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddr} from "./constants.js"

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fundButton");
const balanceButton = document.getElementById("balanceButton")
const balanceTxt = document.getElementById("balance")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connected;
fundButton.onclick = fund;
balanceButton.onclick = getBal;
withdrawButton.onclick = withdraw;

/*Wrap this function in order to make it prompt*/
async function connected() {
  if (typeof window !== "undefined") {
    console.log("Metamask iko nditni");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "Connected";
  } else {
    console.log("Metamask mizzing");
    connectButton.innerHTML = "Weka Metamask mse";
  }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmnt").value
    console.log(`funding with ${ethAmount}...`)
    if(typeof window.ethereum != "undefined"){
      //Arrange requirements for a txn
      const provider = new ethers.providers.Web3Provider(window.ethereum)//This ensures we get the right Metamask account network and settings
      const signer = provider.getSigner()
      const contract = new ethers.Contract(contractAddr, abi, signer)
      //Act on requirements with error mitigators
      try{
        const txnResponse = await contract.fund({
          value: ethers.utils.parseEther(ethAmount),
        })
        await listenForTxnMine(txnResponse, provider) //function to wait for confirmation as a promise
      }
      catch(error){
        console.log(error)
      }
    }
}

async function getBal(){
  if(typeof window.ethereum != "undefined"){
    const provider = new ethers.providers.Web3Provider(window.ethereum)//All transactions need to be signed or reference somewhere
    try{
      const bal = await provider.getBalance(contractAddr)
      const ethBal = ethers.utils.formatEther(bal)
      balanceTxt.innerHTML = ethBal;
    } catch (error){
      console.log(error)
    }
  } else {
    console.log("Metamask mizzing")
    connectButton.innerHTML = "Weka Metamask mze";
  }
}

async function withdraw(){
  if(typeof window.ethereum != "undefined"){
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddr,abi, signer)
    try{
      const txnResponse = await contract.withdraw()
      await listenForTxnMine(txnResponse, provider)//we will also wait for this to get mined.
    } catch(error){
      console.log(error)
    }
  }else{
    console.log("Meta mask mizzing")
  }
}



function listenForTxnMine(txnResponse, provider){
  console.log(`Mining ${txnResponse.hash}`)
  return new Promise((res,rej) =>{
    try{
      provider.once(txnResponse.hash, (transactionReceipt)=>{
        console.log(`Completed with ${transactionReceipt.confirmations} confirmations`)
        res()
      })
    } catch(error){
      rej(error)
    }
  })
}