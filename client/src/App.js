import React, { Component } from "react";
import BasicContract from "./contracts/BasicContract.json";
import getWeb3 from "./utils/getWeb3";

class App extends Component {
  state = { storageValue: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {

    async function enableThor() {
      try {
        const [cometAccount] = await window.thor.enable();
        return cometAccount
      } catch(e) {
          console.log(`User rejected reques ${e}`);
          //handle error
      }
    }

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      enableThor();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      const balance = await web3.eth.getBalance(accounts[0]);  
      const network = BasicContract.networks[5777];
      console.log(web3)
      const instance = new web3.eth.Contract(
        BasicContract.abi,
        network.address
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
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

    web3.eth.sendTransaction({
      from: accounts[0],
      to: recepient,
      value: amount
    }).then(res=>console.log(res))

    contract.methods.transfer(100).send({
      from: accounts[0]
    });

    console.log(await contract.methods.get().call())
    console.log('sent')
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
