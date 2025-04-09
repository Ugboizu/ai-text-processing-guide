import './App.css';
import ChatInterface from './pages/ChatInterface';
import Home from './pages/Home';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <BrowserRouter>
     <div className="App">
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/chat' element={<ChatInterface />} />
        </Routes>
     
      </div>
    </BrowserRouter>
   
  );
}

export default App;
