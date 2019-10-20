import { Cookies } from "react-cookie";
import Axios from 'axios';


const cookies = new Cookies();

class HandleFeide {


    async loggedIn() {
        const token = cookies.get('token');
        if (token !== undefined) {
            localStorage.setItem('token', token);
            localStorage.setItem('loggedin', 'true');
            await Axios( {
                url: 'http://127.0.0.1:8000/auth/user/',
                method: 'GET',
                headers: {
                    Authorization: 'Token ' + token
                }
            }).then(async (response: any) => {
               await localStorage.setItem('user', response.data[0].fields.first_name.split(' ')[0]);
            });
        }
    }
}
export default new HandleFeide();
