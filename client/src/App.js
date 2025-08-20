import './App.css';
import axios from 'axios';

function App() {
  const getPersonData = async() => {
    alert('요청!')
    await axios.get('/users')
    .then(response => {
      console.log(response)
    })
    .catch(err => {
      console.log(err)
    })
    //백엔드서버에 요청전송하기 - axios
  }
  return (
    <div className="App">
      <button onClick = {getPersonData}> 클릭</button>
    </div>
  );
}

export default App;
