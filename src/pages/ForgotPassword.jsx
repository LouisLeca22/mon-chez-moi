import {getAuth, sendPasswordResetEmail} from "firebase/auth"
import { useState } from "react"
import { Link } from "react-router-dom"
import {toast} from "react-toastify"
import {ReactComponent as ArrowRightIcon} from "../assets/svg/keyboardArrowRightIcon.svg"
function ForgotPassword() {

  const [email, setEmail] = useState("")

  const handleChange = (e) => {
    setEmail(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, email)
      toast.success("Un email de récupération vous a été envoyé")
    } catch (error) {
      toast.error("Impossible de modifier votre mot de passe")
    }
  }
  return <div className="pageContainer">
    <header>
      <p className="pageHeader">
        Mot de passe oublié ?
      </p>
    </header>
    <main>
      <form onSubmit={handleSubmit}>
        <input type="email" className="emailInput" placeholder="e-mail" id="email" value={email} onChange={handleChange}/>
        <Link className="forgotPasswordLink" to="/sign-in">
          Se connecter
        </Link>
        <div className="signInBar">
          <div className="signInText">
            Recevoir un mail pour récupérer mon mot de passe ?
          </div>
          <button className="signInButton">
            <ArrowRightIcon fill="#fff" width="34px" height="34px" />
          </button>
        </div>
      </form>
    </main>
  </div>;
}

export default ForgotPassword;
