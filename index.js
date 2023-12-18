import { ethers } from "ethers"
import fs from "fs"

const privates = (fs.readFileSync("./private.txt").toString().replace(/\r\n/g,'\n').split('\n'));


async function approve(key){
    const gas = 100                                  //редактируем
    const provider = new ethers.JsonRpcProvider("https://ethereum.publicnode.com")
    const wallet = new ethers.Wallet(key,provider)
    const swETH = "0xf951E335afb289353dc249e82926178EaC7DEd78"
    const eigenManager = "0x858646372CC42E1A627fcE94aa7A7033e7CF075A"
    const erc20ABI = [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint256","name":"_initialSupply","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"decimals_","type":"uint8"}],"name":"setupDecimals","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"}]
    const tokenIn = new ethers.Contract(swETH, erc20ABI, provider)
    const allowance = await tokenIn.allowance(wallet.address, eigenManager)
    const amount = await tokenIn.balanceOf(wallet.address)
    const decimals = 18

    let gwei = (await provider.getFeeData()).gasPrice;
    if(gas < ethers.formatUnits(gwei, "gwei")){
        do{
            gwei = ((await provider.getFeeData()).gasPrice);
            console.log(`Gwei now ${ethers.formatUnits(gwei, "gwei")} , waiting lowwer than ${gas}`);
    } while(gas < ethers.formatUnits(gwei, "gwei"))
    }
    console.log(gas, ethers.formatUnits(gwei, "gwei"))

    if(allowance < amount){
        const gasEstimateApprove = await tokenIn.connect(wallet).approve.estimateGas(
            eigenManager,
            amount,
            {
                gasPrice:gwei
            }
        )
        const approveTx = await tokenIn.connect(wallet).approve(
            eigenManager,
            amount,
            {
                gasLimit:gasEstimateApprove,
                gasPrice:gwei
            }
        )

        await approveTx.wait()
        console.log(`${ethers.formatUnits(amount, decimals)} swETH approved - ${approveTx.hash}`)
    }

}


for(let i = 0; i < privates.length; i++){
    await approve(privates[i]);
}