import React from 'react';
import './AlertView.css';
import Header from '../header/Header';

const AlertView: React.FC = () => {
  const items = [
    'Andreas',
    'Ingrid',
    'Karoline',
    'Theo',
    'Anders',
    'Alexander',
    'Peik Ove'
  ];
  return (
    <div>
      <header>
        <Header></Header>
      </header>
      <div className='container'>
        <div className='alertbox'>
          {items.map(item => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertView;
