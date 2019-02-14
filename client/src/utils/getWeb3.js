import { thorify } from 'thorify';
import { extend } from 'thorify/dist/extend';
import Web3 from "web3";

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    window.addEventListener("load", () => {
      // Modern dapp browsers... 
      if (window.thor) {
        const web3js = new Web3(window.thor);
        extend(web3js)
        resolve(web3js)
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const web3js = thorify(new Web3(), 'http://localhost:8669');
        resolve(web3js);
      }
    });
  });

export default getWeb3;