import {useState} from "react"
import {toast} from "react-toastify"
import {Link, useNavigate} from "react-router-dom"
import {ReactComponent as ArrowRightIcon} from "../assets/svg/keyboardArrowRightIcon.svg"
import visibilityIcon from "../assets/svg/visibilityIcon.svg"
import {getAuth, signInWithEmailAndPassword} from "firebase/auth"
import Oauth from "../components/Oauth"


function SignIn() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const {email, password} = formData

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const auth = getAuth()

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password) 

      if(userCredential.user) {
        navigate("/")
      }
    } catch (error) {
      toast.error("Identifiant(s)s incorrect(s)")
    }

  }
  return <>
    <div className="pageContainer">
      <header>
        <p className="pageHeader">
          Heureux de vous revoir
        </p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <input type="email" className="emailInput" id="email" value={email} placeholder="E-mail" onChange={handleChange} />
          <div className="passwordInputDiv">
            <input type={showPassword ? "text" : "password"} className="passwordInput" id="password" placeholder="Mot de passe" value={password} onChange={handleChange}/>
            <img src={visibilityIcon} alt="voir le mot de passe"  className="showPassword" onClick={() => setShowPassword((prev) => !prev)}/>
          </div>

          <Link to="/forgot-password" className="forgotPasswordLink">Mot de passe oublié</Link>
          <div className="signInBar">
            <p className="signInText">
              Connexion
            </p>
            <button className="signInButton">
              <ArrowRightIcon fill="#fff" width="34px" height="34px" />
            </button>
          </div>
        </form>
        <Oauth />
        <Link to="/sign-up" className="registerLink">S'isncrire</Link>
      </main>
    </div>
  </>;
}

export default SignIn;
