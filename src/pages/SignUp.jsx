import {useState} from "react"
import {Link, useNavigate} from "react-router-dom"
import {toast} from "react-toastify"
import {ReactComponent as ArrowRightIcon} from "../assets/svg/keyboardArrowRightIcon.svg"
import visibilityIcon from "../assets/svg/visibilityIcon.svg"
import {getAuth, createUserWithEmailAndPassword, updateProfile} from "firebase/auth"
import {setDoc, doc, serverTimestamp} from "firebase/firestore"
import {db} from "../firebase.config"
import Oauth from "../components/Oauth"

function SignUp() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  const {name, email, password} = formData

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      updateProfile(auth.currentUser, {
        displayName: name
      })

      const formDataCopy = {...formData}
      delete formDataCopy.password
      formDataCopy.timestamp = serverTimestamp()

      await setDoc(doc(db, "users", user.uid), formDataCopy)

      navigate("/")
    } catch (error) {
      toast.error("Vérifier les informations")
    }
  }

  return <>
    <div className="pageContainer">
      <header>
        <p className="pageHeader">
          Bienvenue
        </p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
        <input type="text" className="nameInput" id="name" value={name} placeholder="Nom" onChange={handleChange} />
          <input type="email" className="emailInput" id="email" value={email} placeholder="E-mail" onChange={handleChange} />
          <div className="passwordInputDiv">
            <input type={showPassword ? "text" : "password"} className="passwordInput" id="password" placeholder="Mot de passe" value={password} onChange={handleChange}/>
            <img src={visibilityIcon} alt="voir le mot de passe"  className="showPassword" onClick={() => setShowPassword((prev) => !prev)}/>
          </div>
          <div className="signUpBar">
            <p className="signUpText">
              S'inscrire
            </p>
            <button className="signUpButton">
              <ArrowRightIcon fill="#fff" width="34px" height="34px" />
            </button>
          </div>
        </form>
        <Oauth />

        <Link to="/sign-in" className="registerLink">Se connecter ?</Link>
      </main>
    </div>
  </>;
}

export default SignUp;
