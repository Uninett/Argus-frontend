import React, { useState } from 'react';
import './AlertView.css';

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
    <div className='container'>
      {items.map(item => (
        <p>{item}</p>
      ))}
    </div>
  );
};

export default AlertView;
