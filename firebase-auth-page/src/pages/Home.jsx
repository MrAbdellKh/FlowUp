import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <h1>Bienvenue sur Money Management</h1>
      <p className="subtitle">Gérez vos finances en toute simplicité</p>
      
      <div className="features-grid">
        <div className="feature-card">
          <h3>Suivi des Dépenses</h3>
          <p>Suivez facilement toutes vos dépenses quotidiennes</p>
        </div>
        <div className="feature-card">
          <h3>Budgétisation</h3>
          <p>Créez et gérez vos budgets mensuels</p>
        </div>
        <div className="feature-card">
          <h3>Rapports</h3>
          <p>Visualisez vos données financières</p>
        </div>
      </div>

      {!user && (
        <div className="cta-container">
          <Link to="/register" className="btn btn-primary">
            Commencer Maintenant
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Se Connecter
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home; 