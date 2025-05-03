import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase-config'; // Import Firebase Storage
import { collection, query, where, getDocs, doc, setDoc, updateDoc , getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Storage functions
import { auth } from '../firebase-config';
import './Profile.css'; // Import des styles pour les cartes
import defaultImage from '../images/profilDefault.jpg'; // Import de l'image par défaut

const Profile = () => {
  const [userId, setUserId] = useState(null); // ID utilisateur
  const [userName, setUserName] = useState(''); // Nom de l'utilisateur
  const [totalMoney, setTotalMoney] = useState(0); // Total d'argent
  const [profileImage, setProfileImage] = useState(defaultImage); // Image de profil par défaut
  const [activities, setActivities] = useState([]); // Liste des activités
  const [totalRemainingSadaqa, setTotalRemainingSadaqa] = useState(0); // Total de Sadaqa restante
  const [showSadaqaInput, setShowSadaqaInput] = useState(false); // Contrôle de l'affichage

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          setUserId(user.uid); // Stocker l'ID utilisateur

          // Charger les données utilisateur depuis Firestore
          const userDocRef = doc(db, 'userProfiles', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.userName || `Mr. ${user.email.split('@')[0]}`);
            setTotalMoney(userData.totalMoney || 0);
            setProfileImage(userData.profileImage || defaultImage);
          } else {
            // Si aucun profil n'existe, créer un profil par défaut
            await setDoc(userDocRef, {
              userId: user.uid,
              userName: `Mr. ${user.email.split('@')[0]}`,
              totalMoney: 0,
              profileImage: defaultImage,
            });
          }

          // Charger les activités de l'utilisateur
          const activitiesCollectionRef = collection(db, 'activities');
          const q = query(activitiesCollectionRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);

          const fetchedActivities = [];
          let sadaqaRemaining = 0;

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedActivities.push({ id: doc.id, ...data });

            // Calculer le montant restant pour les Sadaqa
            if (data.sadaqaAmount && data.sadaqaPaid !== undefined) {
              const remaining = data.sadaqaAmount - (data.sadaqaPaid || 0);
              sadaqaRemaining += remaining;
            }
          });

          setActivities(fetchedActivities);
          setTotalRemainingSadaqa(sadaqaRemaining);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil utilisateur :', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChangeName = async () => {
    const newName = prompt('Entrez votre nouveau nom :', userName);
    if (newName) {
      setUserName(newName);
      try {
        const userDocRef = doc(db, 'userProfiles', userId);
        await updateDoc(userDocRef, { userName: newName });
        alert('Nom mis à jour avec succès !');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du nom :', error);
      }
    }
  };

  const handleChangeTotalMoney = async () => {
    const newTotal = prompt('Entrez votre nouveau budget total :', totalMoney);
    if (newTotal && !isNaN(newTotal)) {
      const parsedTotal = parseFloat(newTotal);
      setTotalMoney(parsedTotal);
      try {
        const userDocRef = doc(db, 'userProfiles', userId);
        await updateDoc(userDocRef, { totalMoney: parsedTotal });
        alert('Budget total mis à jour avec succès !');
      } catch (error) {
        console.error('Erreur lors de la mise à jour du budget total :', error);
      }
    }
  };

  const handleChangeImage = async (event) => {
    const file = event.target.files[0]; // Récupérer le fichier sélectionné
    if (file) {
      try {
        const storageRef = ref(storage, `profileImages/${userId}`); // Référence dans Firebase Storage
        await uploadBytes(storageRef, file); // Télécharger l'image
        const downloadURL = await getDownloadURL(storageRef); // Obtenir l'URL de téléchargement

        setProfileImage(downloadURL); // Mettre à jour l'image localement

        // Mettre à jour l'image dans Firestore
        const userDocRef = doc(db, 'userProfiles', userId);
        await updateDoc(userDocRef, { profileImage: downloadURL });

        alert('Image de profil mise à jour avec succès !');
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'image de profil :', error);
      }
    }
  };

  const handleSadaqaPayment = async (amount) => {
    const payment = parseFloat(amount);
    if (isNaN(payment) || payment <= 0) {
      alert('Veuillez entrer un montant valide.');
      return;
    }
  
    let remainingPayment = payment; // Montant à soustraire
    const updatedActivities = [...activities].sort((a, b) => new Date(b.date) - new Date(a.date)); // Trier par date décroissante
  
    for (let i = 0; i < updatedActivities.length; i++) {
      const activity = updatedActivities[i];
      const sadaqaRemaining = activity.sadaqaAmount - (activity.sadaqaPaid || 0);
  
      if (remainingPayment <= 0) break;
  
      if (sadaqaRemaining > 0) {
        const paymentForThisActivity = Math.min(sadaqaRemaining, remainingPayment);
        updatedActivities[i].sadaqaPaid = (activity.sadaqaPaid || 0) + paymentForThisActivity;
        remainingPayment -= paymentForThisActivity;
  
        // Mettre à jour Firestore
        const activityDocRef = doc(db, 'activities', activity.id);
        await updateDoc(activityDocRef, { sadaqaPaid: updatedActivities[i].sadaqaPaid });
      }
    }
  
    setActivities(updatedActivities); // Mettre à jour localement
    setTotalRemainingSadaqa(totalRemainingSadaqa - payment); // Mettre à jour le total
    alert('Montant payé mis à jour avec succès !');
  };
  

  return (
    <div className="container mt-5">
      

      {/* Informations personnelles */}
      <div className="profile-info card mb-4">
        <div className="card-body text-center">
          <label htmlFor="profileImageInput">
            <img
              src={`${profileImage}?t=${new Date().getTime()}`} // Ajout d'un timestamp pour éviter le cache
              alt="Profil"
              className="profile-image mb-3"
              style={{ cursor: 'pointer' }}
            />
          </label>
          <input
            type="file"
            id="profileImageInput"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleChangeImage} // Modifier l'image en cliquant dessus
          />
          <h3 onClick={handleChangeName} style={{ cursor: 'pointer', color: '#007bff' }}>
            {userName}
          </h3>
          <p onClick={handleChangeTotalMoney} style={{ cursor: 'pointer', color: '#28a745' }}>
            Budget total : <strong>{totalMoney.toFixed(2)} Dhs</strong>
          </p>
        </div>
      </div>

      {/* Afficher les activités */}
      <div className="activities-container">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-card">
            <h5 className="activity-date">
              📅 {new Date(activity.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
              })}
            </h5>
            <p>📈 <strong>Bénéfices :</strong> {activity.totalGains || 0} Dhs</p>
            <p>🤲 <strong>Reste de Sadaqa :</strong> {(activity.sadaqaAmount - (activity.sadaqaPaid || 0)).toFixed(2)} Dhs</p>
          </div>
        ))}
      </div>

      {/* Afficher le montant total restant pour les Sadaqa */}
      <div className="card mt-4 sadaqa-card">
        <div className="card-body text-center">
          <h3 className="card-title">🤲 Sadaqa restante</h3>
          <p className="sadaqa-amount">
            Montant total restant : <strong>{totalRemainingSadaqa.toFixed(2)} Dhs</strong>
          </p>

          {/* Bouton pour afficher la zone de saisie */}
          {!showSadaqaInput && (
            <button
              className="btn btn-primary"
              onClick={() => setShowSadaqaInput(true)}
            >
              Ajouter Sadaqa
            </button>
          )}

          {/* Zone de saisie affichée uniquement si showSadaqaInput est true */}
          {showSadaqaInput && (
            <div className="update-sadaqa">
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Montant payé"
                onChange={(e) => setShowSadaqaInput(e.target.value)}
              />
              <button
                className="btn btn-success"
                onClick={() => {
                  handleSadaqaPayment(showSadaqaInput);
                  setShowSadaqaInput(false);
                }}
              >
                Confirmer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
