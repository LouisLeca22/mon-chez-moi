import { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from 'firebase/storage';
import {addDoc, collection, serverTimestamp} from "firebase/firestore"
import { db } from '../firebase.config';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';

function CreateListing() {
  const auth = getAuth();
  const navigate = useNavigate();
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'rent',
    name: '',
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: '',
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const isMounted = useRef(true);

  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate('/sign-in');
        }
      });
    }

    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error('Le prix réduit doit être inférieur au prix de base');
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error('Max 6 images');
      return;
    }

    let geolocation = {};
    let location;

    if (geolocationEnabled) {
      const res = await fetch(
        `https://weboscopy.pythonanywhere.com//${address}`
      );

      const data = await res.json();
      geolocation.lat = data.lat ?? 0;
      geolocation.lng = data.long ?? 0;
      location = data.address;
    } else {
      geolocation.lat = latitude;
      geolocation.lng = longitude;
      location = address;
    }

    if (location === undefined || location.includes('undefined')) {
      setLoading(false);
      toast.error('Entrez une adresse valide');
      return;
    }

    // Store images in firebase
    const storeImage = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage()
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

        const storageRef = ref(storage, 'images/' + fileName)

        const uploadTask = uploadBytesResumable(storageRef, image)

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
              default:
                break
            }
          },
          (error) => {
            reject(error)
          },
          () => {
            // Handle successful uploads on complete
            // For instance, get the download URL: https://firebasestorage.googleapis.com/...
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL)
            })
          }
        )
      })
    }

    const imageUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false)
      toast.error('Images not uploaded')
      return
    })

    // Add listing to db
    const formDataCopy = {...formData, imageUrls, geolocation, timestamp: serverTimestamp()}

    delete formDataCopy.images
    delete formDataCopy.address
    location && (formDataCopy.location = location)
    !formDataCopy.offer && delete formDataCopy.discountedPrice

    const docRef = await addDoc(collection(db, "listings"), formDataCopy)
    setLoading(false);
    toast.success("Annonce sauvegardée")
    navigate(`/category/${formDataCopy.type}/${docRef.id}`)
  };

  const handleChange = (e) => {
    let boolean = null;
    if (e.target.value === 'true') {
      boolean = true;
    }

    if (e.target.value === 'false') {
      boolean = false;
    }

    if (e.target.files) {
      setFormData({ ...formData, images: e.target.files });
    }

    if (!e.target.files) {
      setFormData({ ...formData, [e.target.id]: boolean ?? e.target.value });
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className='profile'>
      <header>
        <p className='pageHeader'>Créer une annonce</p>
      </header>
      <main>
        <form onSubmit={handleSubmit}>
          <label className='formLabel'>Louer / Vendre</label>
          <div className='formButtons'>
            <button
              type='button'
              className={type === 'sale' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='sale'
              onClick={handleChange}
            >
              Vendre
            </button>
            <button
              type='button'
              className={type === 'rent' ? 'formButtonActive' : 'formButton'}
              id='type'
              value='rent'
              onClick={handleChange}
            >
              Louer
            </button>
          </div>
          <label className='formLabel'>Nom</label>
          <input
            className='formInputName'
            type='text'
            id='name'
            value={name}
            onChange={handleChange}
            maxLength='32'
            minLength='10'
            required
          />

          <div className='formRooms flex'>
            <div>
              <label className='formLabel'>Chambres</label>
              <input
                className='formInputSmall'
                type='number'
                id='bedrooms'
                value={bedrooms}
                onChange={handleChange}
                min='1'
                max='50'
                required
              />
            </div>
            <div>
              <label className='formLabel'>Salle de bains</label>
              <input
                className='formInputSmall'
                type='number'
                id='bathrooms'
                value={bathrooms}
                onChange={handleChange}
                min='1'
                max='50'
                required
              />
            </div>
          </div>

          <label className='formLabel'>Parking</label>
          <div className='formButtons'>
            <button
              className={parking ? 'formButtonActive' : 'formButton'}
              type='button'
              id='parking'
              value={true}
              onClick={handleChange}
              min='1'
              max='50'
            >
              Oui
            </button>
            <button
              className={
                !parking && parking !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='parking'
              value={false}
              onClick={handleChange}
            >
              Non
            </button>
          </div>

          <label className='formLabel'>Meublé</label>
          <div className='formButtons'>
            <button
              className={furnished ? 'formButtonActive' : 'formButton'}
              type='button'
              id='furnished'
              value={true}
              onClick={handleChange}
            >
              Oui
            </button>
            <button
              className={
                !furnished && furnished !== null
                  ? 'formButtonActive'
                  : 'formButton'
              }
              type='button'
              id='furnished'
              value={false}
              onClick={handleChange}
            >
              Non
            </button>
          </div>

          <label className='formLabel'>Adresse</label>
          <textarea
            className='formInputAddress'
            type='text'
            id='address'
            value={address}
            onChange={handleChange}
            required
          />

          {!geolocationEnabled && (
            <div className='formLatLng flex'>
              <div>
                <label className='formLabel'>Latitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='latitude'
                  value={latitude}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className='formLabel'>Longitude</label>
                <input
                  className='formInputSmall'
                  type='number'
                  id='longitude'
                  value={longitude}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <label className='formLabel'>Offre</label>
          <div className='formButtons'>
            <button
              className={offer ? 'formButtonActive' : 'formButton'}
              type='button'
              id='offer'
              value={true}
              onClick={handleChange}
            >
              Oui
            </button>
            <button
              className={
                !offer && offer !== null ? 'formButtonActive' : 'formButton'
              }
              type='button'
              id='offer'
              value={false}
              onClick={handleChange}
            >
              Non
            </button>
          </div>

          <label className='formLabel'>Prix de base</label>
          <div className='formPriceDiv'>
            <input
              className='formInputSmall'
              type='number'
              id='regularPrice'
              value={regularPrice}
              onChange={handleChange}
              min='50'
              max='750000000'
              required
            />
            {type === 'rent' && <p className='formPriceText'>€ / Mois</p>}
          </div>

          {offer && (
            <>
              <label className='formLabel'>Prix réduit</label>
              <input
                className='formInputSmall'
                type='number'
                id='discountedPrice'
                value={discountedPrice}
                onChange={handleChange}
                min='50'
                max='750000000'
                required={offer}
              />
            </>
          )}

          <label className='formLabel'>Images</label>
          <p className='imagesInfo'>
            La première image sera l'image de couverture (max 6).
          </p>
          <input
            className='formInputFile'
            type='file'
            id='images'
            onChange={handleChange}
            max='6'
            accept='.jpg,.png,.jpeg'
            multiple
            required
          />
          <button type='submit' className='primaryButton createListingButton'>
            Créer l'annonce
          </button>
        </form>
      </main>
    </div>
  );
}

export default CreateListing;
