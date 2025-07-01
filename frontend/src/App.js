import Home from './screens/Home';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import '../node_modules/bootstrap-dark-5/dist/css/bootstrap-dark.min.css'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle'
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
import Login from './screens/Login.js';
import Signup from './screens/Signup.js';
import Creators from './screens/Creators.js';
import Myprofile from './screens/Myprofile.js';
import CreateBlog from './screens/CreateBlog.js';
import UpdateBlog from './screens/UpdateBlog.js';
import ViewBlog from './screens/ViewBlog.js';
import CreatorProfile from './screens/CreatorProfile.js';
function App() {
  return (
    <Router>
    <div>
      <Routes>
        <Route exact path="/" element={<Home/>}></Route>
        <Route exact path="/Login" element={<Login/>}></Route>
        <Route exact path="/createuser" element={<Signup/>}></Route>
        <Route exact path="/createblog" element={<CreateBlog/>}></Route>
        <Route exact path="/updateblog" element={<UpdateBlog/>}></Route>
        <Route exact path="/viewblog" element={<ViewBlog/>}></Route>
        <Route exact path="/myprofile" element={<Myprofile/>}></Route>
        <Route exact path="/creators" element={<Creators/>}></Route>
        <Route exact path="/creatorprofile" element={<CreatorProfile/>}></Route>
      </Routes>
    </div>
    </Router>
  );
}

export default App;
