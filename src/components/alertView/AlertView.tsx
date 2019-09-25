import React, { useState } from 'react';
import './AlertView.css';
import Header from '../header/Header'

const AlertView: React.FC = () => {
  const [items, setItem] = useState([
    'Andreas',
    'Ingrid',
    'Karoline',
    'Theo',
    'Anders',
    'Alexander',
    'Peik Ove'
  ]);
  return (
    <div>
    <header>
      <Header></Header>
    </header>
    <div className='container'>
    <div className='alertbox'>
      {items.map(item => (
        <p>{item}</p>
        ))}
      </div>
    </div>
        </div>
  );
};

export default AlertView;
