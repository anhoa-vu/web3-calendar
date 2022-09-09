import './App.css';

function App() {

  const connect = () => {
    alert('connect');
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
