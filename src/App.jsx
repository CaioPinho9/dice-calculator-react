import logo from './logo.png';
import './App.css';
import Counter from './Counter';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Counter/>
      </header>
    </div>
  );
}

export default App;
