import React, { useState, useEffect } from 'react';
import './landing.css';
import { db } from '../firebase-config';
import { collection, doc, setDoc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { auth } from '../firebase-config';

const Landing = () => {
  const [investment, setInvestment] = useState('');
  const [sales, setSales] = useState([{ name: '', purchasePrice: '', salePrice: '', quantity: '' }]);
  const [rentals, setRentals] = useState([{ name: '', rentalPrice: '', rentalCount: '' }]);
  const [expenses, setExpenses] = useState([{ name: '', amount: '' }]);
  const [salesProfit, setSalesProfit] = useState(0);
  const [rentalIncome, setRentalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [remainingInvestment, setRemainingInvestment] = useState(0);
  const [totalGains, setTotalGains] = useState(0);
  const [sadaqaPercentage, setSadaqaPercentage] = useState('');
  const [sadaqaAmount, setSadaqaAmount] = useState(0);
  const [sadaqaStatus, setSadaqaStatus] = useState('Pas encore');
  const [sadaqaPaid, setSadaqaPaid] = useState('');
  const [activityDocId, setActivityDocId] = useState(null);

  const activitiesCollectionRef = collection(db, 'activities');

  // Charger les données depuis Firestore pour l'utilisateur connecté
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const q = query(activitiesCollectionRef, where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            setActivityDocId(doc.id); // Stocker l'ID du document pour les mises à jour
            setInvestment(data.investment || '');
            setSales(data.sales || []);
            setRentals(data.rentals || []);
            setExpenses(data.expenses || []);
            setSadaqaPercentage(data.sadaqaPercentage || '');
            setSadaqaStatus(data.sadaqaStatus || 'Pas encore');
            setSadaqaPaid(data.sadaqaPaid || '');
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur :', error);
      }
    };

    fetchUserData();
  }, []);

  // Calcul automatique
  useEffect(() => {
    const calculateSalesProfit = () => {
      const profit = sales.reduce(
        (acc, sale) =>
          acc +
          ((parseFloat(sale.salePrice) - parseFloat(sale.purchasePrice)) * parseFloat(sale.quantity) || 0),
        0
      );
      setSalesProfit(profit);
    };

    const calculateRentalIncome = () => {
      const income = rentals.reduce(
        (acc, rental) => acc + (parseFloat(rental.rentalPrice) * parseFloat(rental.rentalCount) || 0),
        0
      );
      setRentalIncome(income);
    };

    const calculateTotalExpenses = () => {
      const expensesTotal = expenses.reduce(
        (acc, expense) => acc + (parseFloat(expense.amount) || 0),
        0
      );
      setTotalExpenses(expensesTotal);
    };

    const calculateRemainingInvestment = () => {
      const totalIncome = salesProfit + rentalIncome;
      const remaining = investment - totalIncome + totalExpenses;
      setRemainingInvestment(remaining);

      // Calculer les gains totaux
      const gains = totalIncome - totalExpenses;
      setTotalGains(gains);

      // Calculer la Sadaqa
      const sadaqa = (gains * sadaqaPercentage) / 100;
      setSadaqaAmount(sadaqa);
    };

    calculateSalesProfit();
    calculateRentalIncome();
    calculateTotalExpenses();
    calculateRemainingInvestment();
  }, [investment, sales, rentals, expenses, sadaqaPercentage, salesProfit, rentalIncome, totalExpenses]);

  const saveActivityToFirebase = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const today = new Date().toISOString().split('T')[0]; // Obtenir la date du jour (YYYY-MM-DD)
        const q = query(activitiesCollectionRef, where('userId', '==', user.uid), where('date', '==', today));
        const querySnapshot = await getDocs(q);

        let activityData = {
          userId: user.uid,
          date: today,
          investment,
          sales,
          rentals,
          expenses,
          totalGains,
          sadaqaPercentage,
          sadaqaAmount,
          sadaqaStatus,
          sadaqaPaid,
        };

        if (!querySnapshot.empty) {
          // Si une insertion existe déjà pour aujourd'hui, mettez à jour les données
          const existingDoc = querySnapshot.docs[0];
          const existingData = existingDoc.data();

          // Additionner les valeurs existantes avec les nouvelles
          activityData = {
            ...activityData,
            investment: parseFloat(existingData.investment || 0) + parseFloat(investment || 0),
            sales: [...existingData.sales, ...sales],
            rentals: [...existingData.rentals, ...rentals],
            expenses: [...existingData.expenses, ...expenses],
            totalGains: parseFloat(existingData.totalGains || 0) + parseFloat(totalGains || 0),
            sadaqaAmount: parseFloat(existingData.sadaqaAmount || 0) + parseFloat(sadaqaAmount || 0),
            sadaqaPaid: parseFloat(existingData.sadaqaPaid || 0) + parseFloat(sadaqaPaid || 0),
          };

          // Mettre à jour le document existant
          const activityDocRef = doc(db, 'activities', existingDoc.id);
          await setDoc(activityDocRef, activityData);
          alert('Activité mise à jour avec succès dans Firebase !');
        } else {
          // Créer un nouveau document si aucune insertion n'existe pour aujourd'hui
          const newDocRef = await addDoc(activitiesCollectionRef, activityData);
          alert('Activité sauvegardée avec succès dans Firebase !');
        }
      } else {
        alert('Veuillez vous connecter pour sauvegarder vos données.');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde :', error);
    }
  };

  const handleLogout = () => {
    setInvestment('');
    setSales([{ name: '', purchasePrice: '', salePrice: '', quantity: '' }]);
    setRentals([{ name: '', rentalPrice: '', rentalCount: '' }]);
    setExpenses([{ name: '', amount: '' }]);
    setSadaqaPercentage('');
    setSadaqaStatus('Pas encore');
    setSadaqaPaid('');
    setSadaqaAmount(0);
    alert('effacer la formulaire avec succès.');
  };

  const handleAddSale = () => {
    setSales([...sales, { name: '', purchasePrice: '', salePrice: '', quantity: '' }]);
  };

  const handleAddRental = () => {
    setRentals([...rentals, { name: '', rentalPrice: '', rentalCount: '' }]);
  };

  const handleAddExpense = () => {
    setExpenses([...expenses, { name: '', amount: '' }]);
  };

  return (
    <div className="container mt-5">

      <h1 className="text-center mb-4 title">💰 Gestion de l'Argent 💰</h1>
      {/* Résumé */}
      <div className="summary-card shadow-sm">
        <h3 className="summary-title">📊 Résumé</h3>
        <p>📅 Aujourd'hui, vous avez gagné un total de <strong>{totalGains.toFixed(2)} Dhs</strong>.</p>
        {remainingInvestment >= 0 ? (
          <p>💼 Il vous reste <strong>{remainingInvestment.toFixed(2)} Dhs</strong> pour couvrir votre investissement.</p>
        ) : (
          <p>💼 Vous avez réalisé un <strong>bénéfice</strong> de <strong>{Math.abs(remainingInvestment).toFixed(2)} Dhs</strong>.</p>
        )}
        <p>🤲 Statut de la Sadaqa : <strong>{sadaqaStatus}</strong></p>
        <p>💰 Montant total de la Sadaqa : <strong>{sadaqaAmount.toFixed(2)} Dhs</strong></p>
        {sadaqaStatus === 'Partiellement payé' && (
          <p>
            Montant payé : <strong>{sadaqaPaid} Dhs</strong>, Montant restant :{' '}
            <strong>{(sadaqaAmount - sadaqaPaid).toFixed(2)} Dhs</strong>
          </p>
        )}
      </div>

      {/* Section des fonctionnalités */}
      <div className="row">
        {/* Investissement */}
        <div className="col-md-3">
          <div className="card section-card shadow-sm">
            <div className="card-body">
              <h3 className="section-title">💵 Investissement</h3>
              <div className="form-group">
                <label>Montant total investi :</label>
                <input
                  type="number"
                  className="form-control"
                  value={investment}
                  onChange={(e) => setInvestment(parseFloat(e.target.value) || '')}
                  placeholder="Exemple : 10000 Dhs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ventes */}
        <div className="col-md-3">
          <div className="card section-card shadow-sm">
            <div className="card-body">
              <h3 className="section-title">🛒 Ventes</h3>
              {sales.map((sale, index) => (
                <div key={index} className="mb-3">
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={sale.name}
                    onChange={(e) => {
                      const newSales = [...sales];
                      newSales[index].name = e.target.value;
                      setSales(newSales);
                    }}
                    placeholder="Nom de l'article"
                  />
                  <input
                    type="number"
                    className="form-control mb-2"
                    value={sale.purchasePrice}
                    onChange={(e) => {
                      const newSales = [...sales];
                      newSales[index].purchasePrice = e.target.value;
                      setSales(newSales);
                    }}
                    placeholder="Prix d'achat"
                  />
                  <input
                    type="number"
                    className="form-control mb-2"
                    value={sale.salePrice}
                    onChange={(e) => {
                      const newSales = [...sales];
                      newSales[index].salePrice = e.target.value;
                      setSales(newSales);
                    }}
                    placeholder="Prix de vente"
                  />
                  <input
                    type="number"
                    className="form-control"
                    value={sale.quantity}
                    onChange={(e) => {
                      const newSales = [...sales];
                      newSales[index].quantity = e.target.value;
                      setSales(newSales);
                    }}
                    placeholder="Quantité vendue"
                  />
                </div>
              ))}
              <button className="btn btn-secondary" onClick={handleAddSale}>
                ➕ Ajouter une vente
              </button>
            </div>
          </div>
        </div>

        {/* Locations */}
        <div className="col-md-3">
          <div className="card section-card shadow-sm">
            <div className="card-body">
              <h3 className="section-title">🎲 Locations</h3>
              {rentals.map((rental, index) => (
                <div key={index} className="mb-3">
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={rental.name}
                    onChange={(e) => {
                      const newRentals = [...rentals];
                      newRentals[index].name = e.target.value;
                      setRentals(newRentals);
                    }}
                    placeholder="Nom de l'article"
                  />
                  <input
                    type="number"
                    className="form-control mb-2"
                    value={rental.rentalPrice}
                    onChange={(e) => {
                      const newRentals = [...rentals];
                      newRentals[index].rentalPrice = e.target.value;
                      setRentals(newRentals);
                    }}
                    placeholder="Prix de location"
                  />
                  <input
                    type="number"
                    className="form-control"
                    value={rental.rentalCount}
                    onChange={(e) => {
                      const newRentals = [...rentals];
                      newRentals[index].rentalCount = e.target.value;
                      setRentals(newRentals);
                    }}
                    placeholder="Nombre de locations"
                  />
                </div>
              ))}
              <button className="btn btn-secondary" onClick={handleAddRental}>
                ➕ Ajouter une location
              </button>
            </div>
          </div>
        </div>

        {/* Dépenses */}
        <div className="col-md-3">
          <div className="card section-card shadow-sm">
            <div className="card-body">
              <h3 className="section-title">🍔 Dépenses</h3>
              {expenses.map((expense, index) => (
                <div key={index} className="mb-3">
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={expense.name}
                    onChange={(e) => {
                      const newExpenses = [...expenses];
                      newExpenses[index].name = e.target.value;
                      setExpenses(newExpenses);
                    }}
                    placeholder="Nom de la dépense"
                  />
                  <input
                    type="number"
                    className="form-control"
                    value={expense.amount}
                    onChange={(e) => {
                      const newExpenses = [...expenses];
                      newExpenses[index].amount = e.target.value;
                      setExpenses(newExpenses);
                    }}
                    placeholder="Montant"
                  />
                </div>
              ))}
              <button className="btn btn-secondary" onClick={handleAddExpense}>
                ➕ Ajouter une dépense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section Sadaqa */}
      <div className="card mt-4 section-card shadow-sm">
        <div className="card-body">
          <h3 className="section-title">🤲 Sadaqa</h3>
          <div className="form-group">
            <label>Pourcentage de Sadaqa :</label>
            <input
              type="number"
              className="form-control"
              value={sadaqaPercentage}
              onChange={(e) => setSadaqaPercentage(parseFloat(e.target.value) || '')}
              placeholder="Exemple : 2%"
            />
          </div>
          <div className="form-group">
            <label>Statut de la Sadaqa :</label>
            <select
              className="form-control"
              value={sadaqaStatus}
              onChange={(e) => setSadaqaStatus(e.target.value)}
            >
              <option value="Pas encore">Pas encore</option>
              <option value="Donné">Donné</option>
              <option value="Partiellement payé">Partiellement payé</option>
            </select>
          </div>
          {sadaqaStatus === 'Partiellement payé' && (
            <div className="form-group">
              <label>Montant payé :</label>
              <input
                type="number"
                className="form-control"
                value={sadaqaPaid}
                onChange={(e) => setSadaqaPaid(parseFloat(e.target.value) || '')}
                placeholder="Exemple : 50 Dhs"
              />
            </div>
          )}
          <p>Montant total de la Sadaqa : {sadaqaAmount.toFixed(2)} Dhs</p>
          {sadaqaStatus === 'Partiellement payé' && (
            <p>Montant restant : {(sadaqaAmount - sadaqaPaid).toFixed(2)} Dhs</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="d-flex justify-content-between mt-4"></div>
        <button className="btn btn-primary" onClick={saveActivityToFirebase}>
          💾 Sauvegarder dans Firebase
        </button>
        <button className="btn btn-danger" onClick={handleLogout}>
          effacer les données
        </button>
      </div>
    
  );
};

export default Landing;