import {useLocation, useNavigate} from "react-router-dom"
import {getAuth, signInWithPopup, GoogleAuthProvider} from "firebase/auth"
import {doc, setDoc, getDoc, serverTimestamp} from "firebase/firestore"
import {db} from "../firebase.config"
import {toast} from "react-toastify"
import googleIcon from "../assets/svg/googleIcon.svg"

function Oauth() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleGoogle = async () => {
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      // Check for user 
      const userRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(userRef)

      console.log(docSnap)

      // If doesn't exist, create one
      if(!docSnap.exists()){
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp()
        })
      }

      navigate("/")
    } catch (error) {
      toast.error("Impossible de se connecter avec Google")
    }
  }
  return <div className="socialLogin">
    <p>{location.pathname === "/sign-up" ? "S'inscrire": "Se connecter"} avec</p>
    <button className="socialIconDiv" onClick={handleGoogle}>
      <img className="socialIconImg" src={googleIcon} alt="google" />
    </button>
  </div>;
}

export default Oauth;
