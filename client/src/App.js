import './App.css';
import axios from 'axios';
import { useState } from 'react';

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
    data => (<div key = {data.no} className='person'>
      <div>아이디: {data.person_id}</div>
      <div>이름: {data.person_name}</div>
      <div>나이: {data.age}</div>
      <div>생일: {data.birthday}</div>
    </div>)
  )

  return (
    <div className="App">
      <button onClick = {getPersonData}> 클릭</button>
      {result}
    </div>
  );
}

export default App;
