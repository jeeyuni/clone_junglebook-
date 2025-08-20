
import '../css/User.css';

function User(props) {
    return (
        <div className = 'user'>
            <div>아이디: {props.person_id}</div>
            <div>이름: {props.person_name}</div>
            <div>나이: {props.age}</div>
            <div>생일: {props.birthday}</div>
        </div>
    )
}

export default User;