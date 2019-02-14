import React, { Component } from "react";
import getWeb3 from "./utils/getWeb3";
import Bet from './contracts/Bet.json';

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {

    async function enableThor() {
      try {
        const [cometAccount] = await window.thor.enable();
        return cometAccount
      } catch(e) {
          console.log(`User rejected request ${e}`);
          //handle error
      }
    }

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3(); 
      enableThor();
      console.log(web3)

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);  
      const network = Bet.networks[5777];

      await web3.eth.getChainTag().then(chainTagHex => {
        const chainTag = parseInt(chainTagHex, 16)
          switch (chainTag) {
            case 74:
              console.log('This is mainnet')
              break
            case 39:
              console.log('This is testnet')
              break
            case 199:
              console.log('This is localhost.')
              break
            default:
              console.log('This is an unknown network.')
          }
        })

      const instance = new web3.eth.Contract(
        Bet.abi,
        network.address
      );

      this.setState({ web3, accounts, balance, 'contract': instance });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
    }
  };

  sendTransaction = async() => {
    const { web3, contract, accounts } = this.state
    //const sender = web3.eth.accounts.wallet.add(accounts[0]);
    const recepient = document.getElementById('address').value;
    const amount = document.getElementById('amount').value;

    /*web3.eth.sendTransaction({
      from: accounts[0],
      to: recepient,
      value: amount
    }).then(res=>console.log(res))*/
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading account</div>;
    }
    return (
      <div className="App">
        address: {this.state.accounts[0]}
        balance: {this.state.balance}
        <input placeholder="insert address" id="address"/>
        <input placeholder="insert amount" id="amount"/>
        <button onClick={this.sendTransaction}>send</button>
      </div>
    );
  }
}

export default App;
