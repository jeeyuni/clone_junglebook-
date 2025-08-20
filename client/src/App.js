import './App.css';
import axios from 'axios';
import { useState } from 'react';
import User from './components/User';

function App() {
  const [personList, setPersonList] = useState([])
  const getPersonData = async() => {
    alert('요청!')
    await axios.get('/users')
    .then(response => {
      console.log(response)
      console.log(response.data)
      setPersonList(response.data)
    })
    .catch(err => {
      console.log(err)
    })
    //백엔드서버에 요청전송하기 - axios
  }
  const result = personList.map(
    data => (< User person_id = {data.person_id} person_name = {data.person_name} 
                age = {data.age} birthday = {data.birthday}/>)
  )

  return (
    <div className="App">
      <h1>사람 목록</h1>
      <button onClick = {getPersonData}> 클릭</button>
      {result}
    </div>
  );
}

export default App;
