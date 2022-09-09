import './App.css';
import detectEthereumProvider from '@metamask/detect-provider';
import { useState } from 'react';
  
function App() {

  const [account, setAccount] = useState(false);

  const connect =  async() => {
    try {
      const provider = await detectEthereumProvider();
      //return array of accounts
      const accounts = await provider.request({method: "eth_requestAccounts"});

      //check if array at least one element
      if (accounts.length > 0){
        console.log('account found', accounts);
        setAccount(account[0]);
        console(account);
      } else {
        console.log('No account found');
      }
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <div className="App">
      <header className="App-header">
        <h1>calend3</h1>
        <div id='slogan'>web3 appoinment scheduling</div>

        <button onClick={connect}>connect wallet</button>
      </header>
    </div>
  );
}
 
export default App;
